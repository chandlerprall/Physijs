'use strict';

var	
	transferableMessage = self.webkitPostMessage || self.postMessage,
	
	// enum
	MESSAGE_TYPES = {
		WORLDREPORT: 0,
		COLLISIONREPORT: 1
	},
	
	// temp variables
	_object,
	_vector,
	_transform,
	
	// functions
	public_functions = {},
	getShapeFromCache,
	setShapeCache,
	createShape,
	reportWorld,
	reportCollisions,
	
	// world variables
	fixedTimeStep, // used when calling stepSimulation
	last_simulation_time, // store in *seconds*
	world,
	
	// private cache
	_now,
	_objects = {},
	_materials = {},
	_objects_ammo = {},
	_num_objects = 0,
	_object_shapes = {},
	
	// object reporting
	REPORT_CHUNKSIZE, // report array is increased in increments of this chunk size
	
	WORLDREPORT_ITEMSIZE = 14, // how many float values each reported item needs
	worldreport,
	
	COLLISIONREPORT_ITEMSIZE = 2, // one float for each object id
	collisionreport;


getShapeFromCache = function ( cache_key ) {
	if ( _object_shapes[ cache_key ] !== undefined ) {
		return _object_shapes[ cache_key ];
	}
	return null;
};

setShapeCache = function ( cache_key, shape ) {
	_object_shapes[ cache_key ] = shape;
}

createShape = function( description ) {
	var cache_key, shape;
	
	_transform.setIdentity();
	
	switch ( description.type ) {
		case 'plane':
			cache_key = 'plane_' + description.normal.x + '_' + description.normal.y + '_' + description.normal.z;
			if ( ( shape = getShapeFromCache( cache_key ) ) === null ) {
				shape = new Ammo.btStaticPlaneShape( new Ammo.btVector3( description.normal.x, description.normal.y, description.normal.z ) );
				setShapeCache( cache_key, shape );
			}
			break;
		
		case 'box':
			cache_key = 'box_' + description.width + '_' + description.height + '_' + description.depth;
			if ( ( shape = getShapeFromCache( cache_key ) ) === null ) {
				shape = new Ammo.btBoxShape(new Ammo.btVector3( description.width / 2, description.height / 2, description.depth / 2 ));
				setShapeCache( cache_key, shape );
			}
			break;
		
		case 'sphere':
			cache_key = 'sphere_' + description.radius;
			if ( ( shape = getShapeFromCache( cache_key ) ) === null ) {
				shape = new Ammo.btSphereShape( description.radius );
				setShapeCache( cache_key, shape );
			}
			break;
		
		case 'cylinder':
			cache_key = 'cylinder_' + description.width + '_' + description.height + '_' + description.depth;
			if ( ( shape = getShapeFromCache( cache_key ) ) === null ) {
				shape = new Ammo.btCylinderShape(new Ammo.btVector3( description.width / 2, description.height / 2, description.depth / 2 ));
				setShapeCache( cache_key, shape );
			}
			break;
		
		case 'cone':
			cache_key = 'cone_' + description.radius + '_' + description.height;
			if ( ( shape = getShapeFromCache( cache_key ) ) === null ) {
				shape = new Ammo.btConeShape( description.radius, description.height );
				setShapeCache( cache_key, shape );
			}
			break;
		
		case 'triangle':
			var i, triangle, triangle_mesh = new Ammo.btTriangleMesh;
			for ( i = 0; i < description.triangles.length; i++ ) {
				triangle = description.triangles[i];
				triangle_mesh.addTriangle(
					new Ammo.btVector3( triangle[0][0], triangle[0][1], triangle[0][2] ),
					new Ammo.btVector3( triangle[1][0], triangle[1][1], triangle[1][2] ),
					new Ammo.btVector3( triangle[2][0], triangle[2][1], triangle[2][2] ),
					true
				);
			}
			shape = new Ammo.btConvexTriangleMeshShape(
				triangle_mesh,
				true
			);
			break;
		
		case 'convex':
			var i, point, shape = new Ammo.btConvexHullShape;
			for ( i = 0; i < description.points.length; i++ ) {
				point = description.points[i];
				shape.addPoint( new Ammo.btVector3( point.x, point.y, point.z ) );
			}
			break;
		
		default:
			// Not recognized
			return;
			break;
	}
	
	return shape;
};

public_functions.init = function( params ) {
	importScripts( params.ammo );
	_transform = new Ammo.btTransform;
	
	REPORT_CHUNKSIZE = params.reportsize || 50;
	worldreport = new Float32Array(2 + REPORT_CHUNKSIZE * WORLDREPORT_ITEMSIZE); // message id + # of objects to report + chunk size * # of values per object
	worldreport[0] = MESSAGE_TYPES.WORLDREPORT;
	
	collisionreport = new Float32Array(2 + REPORT_CHUNKSIZE * COLLISIONREPORT_ITEMSIZE); // message id + # of collisions to report + chunk size * # of values per object
	collisionreport[0] = MESSAGE_TYPES.COLLISIONREPORT;
	
	var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration,
		dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration ),
		solver = new Ammo.btSequentialImpulseConstraintSolver,
		broadphase;
	
	if ( !params.broadphase ) params.broadphase = { type: 'dynamic' };
	switch ( params.broadphase.type ) {
		case 'sweepprune':
			broadphase = new Ammo.btAxisSweep3(
				new Ammo.btVector3( params.broadphase.aabbmin.x, params.broadphase.aabbmin.y, params.broadphase.aabbmax.z ),
				new Ammo.btVector3( params.broadphase.aabbmax.x, params.broadphase.aabbmax.y, params.broadphase.aabbmax.z )
			);
			break;
		
		case 'dynamic':
		default:
			broadphase = new Ammo.btDbvtBroadphase;
	}
	
	world = new Ammo.btDiscreteDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration );
	
	fixedTimeStep = params.fixedTimeStep || 1 / 60;
};

public_functions.registerMaterial = function( description ) {
	_materials[ description.id ] = description;
};

public_functions.setGravity = function( description ) {
	world.setGravity(new Ammo.btVector3( description.x, description.y, description.z ));
};

public_functions.addObject = function( description ) {
	var i,
		localInertia, shape, motionState, rbInfo, body;
	
	shape = createShape( description );
	
	// If there are children then this is a compound shape
	if ( description.children ) {
		var compound_shape = new Ammo.btCompoundShape, _child;
		compound_shape.addChildShape( _transform, shape );
		
		for ( i = 0; i < description.children.length; i++ ) {
			_child = description.children[i];
			var trans = new Ammo.btTransform;
			trans.setIdentity();
			trans.setOrigin(new Ammo.btVector3( _child.offset.x, _child.offset.y, _child.offset.z ));
			trans.setRotation(new Ammo.btQuaternion( _child.rotation.x, _child.rotation.y, _child.rotation.z, _child.rotation.w ));
			
			shape = createShape( description.children[i] );
			compound_shape.addChildShape( trans, shape );
		}
		
		shape = compound_shape;
	}
	
	localInertia = new Ammo.btVector3(0, 0, 0); // #TODO: localIntertia is the local inertia tensor, what does it do and should it be a parameter?
	shape.calculateLocalInertia( description.mass, localInertia );
	
	_transform.setIdentity();
	_transform.setOrigin(new Ammo.btVector3( description.position.x, description.position.y, description.position.z ));
	_transform.setRotation(new Ammo.btQuaternion( description.rotation.x, description.rotation.y, description.rotation.z, description.rotation.w ));
	
	motionState = new Ammo.btDefaultMotionState( _transform ); // #TODO: btDefaultMotionState supports center of mass offset as second argument - implement
	rbInfo = new Ammo.btRigidBodyConstructionInfo( description.mass, motionState, shape, localInertia );
	
	if ( description.materialId !== undefined ) {
		rbInfo.set_m_friction( _materials[ description.materialId ].friction );
		rbInfo.set_m_restitution( _materials[ description.materialId ].restitution );
	}
	
	body = new Ammo.btRigidBody( rbInfo );
	
	if ( typeof description.collision_flags !== 'undefined' ) {
		body.setCollisionFlags( description.collision_flags );
	}
	
	world.addRigidBody( body );
	
	body.id = description.id;
	_objects[ body.id ] = body;
	_objects_ammo[body.a] = body.id;
	_num_objects++;
	
	transferableMessage({ cmd: 'objectReady', params: body.id });
};

public_functions.removeObject = function( details ) {
	world.removeRigidBody( _objects[details.id] );
	delete _objects[details.id];
	_num_objects--;
};

public_functions.updateTransform = function( details ) {
	_object = _objects[details.id];
	_object.getMotionState().getWorldTransform( _transform );
	
	if ( details.pos ) {
		_transform.setOrigin(new Ammo.btVector3( details.pos.x, details.pos.y, details.pos.z ));
	}
	
	if ( details.quat ) {
		_transform.setRotation(new Ammo.btQuaternion( details.quat.x, details.quat.y, details.quat.z, details.quat.w ));
	}
	
	_object.setWorldTransform( _transform );
	_object.activate();
};

public_functions.updateMass = function( details ) {
	// #TODO: changing a static object into dynamic is buggy
	_object = _objects[details.id];
	
	// Per http://www.bulletphysics.org/Bullet/phpBB3/viewtopic.php?p=&f=9&t=3663#p13816
	world.removeRigidBody( _object );
	_object.setMassProps( details.mass, new Ammo.btVector3(0, 0, 0) );
	world.addRigidBody( _object );
	_object.activate();
};

public_functions.applyCentralImpulse = function ( details ) {
	_objects[details.id].applyCentralImpulse(new Ammo.btVector3( details.x, details.y, details.z ));
	_objects[details.id].activate();
};

public_functions.applyImpulse = function ( details ) {
	_objects[details.id].applyImpulse(
		new Ammo.btVector3( details.impulse_x, details.impulse_y, details.impulse_z ),
		new Ammo.btVector3( details.x, details.y, details.z )
	);
	_objects[details.id].activate();
};

public_functions.applyCentralForce = function ( details ) {
	_objects[details.id].applyCentralForce(new Ammo.btVector3( details.x, details.y, details.z ));
	_objects[details.id].activate();
};

public_functions.applyForce = function ( details ) {
	_objects[details.id].applyImpulse(
		new Ammo.btVector3( details.impulse_x, details.impulse_y, details.impulse_z ),
		new Ammo.btVector3( details.x, details.y, details.z )
	);
	_objects[details.id].activate();
};

public_functions.setAngularVelocity = function ( details ) {
	_objects[details.id].setAngularVelocity(
		new Ammo.btVector3( details.x, details.y, details.z )
	);
	_objects[details.id].activate();
};

public_functions.setLinearVelocity = function ( details ) {
	_objects[details.id].setLinearVelocity(
		new Ammo.btVector3( details.x, details.y, details.z )
	);
	_objects[details.id].activate();
};

public_functions.setAngularFactor = function ( details ) {
	_objects[details.id].setAngularFactor(
		new Ammo.btVector3( details.x, details.y, details.z )
	);
};

public_functions.setLinearFactor = function ( details ) {
	_objects[details.id].setLinearFactor(
		new Ammo.btVector3( details.x, details.y, details.z )
	);
};

public_functions.setCcdMotionThreshold = function ( details ) {
	_objects[details.id].setCcdMotionThreshold( details.threshold );
};

public_functions.setCcdSweptSphereRadius = function ( details ) {
	_objects[details.id].setCcdSweptSphereRadius( details.radius );
};

public_functions.simulate = function( params ) {
	if ( world ) {
		params = params || {};
		_now = new Date().getTime() / 1000; // store in *seconds*
		
		if ( !params.timeStep ) {
			if ( last_simulation_time ) {
				params.timeStep = _now - last_simulation_time; // time since last simulation
			} else {
				params.timeStep = fixedTimeStep; // handle first frame
			}
		}
		
		params.maxSubSteps = params.maxSubSteps || Math.ceil( params.timeStep / fixedTimeStep ); // If maxSubSteps is not defined, keep the simulation fully up to date
		
		world.stepSimulation( params.timeStep, params.maxSubSteps, fixedTimeStep );
		reportWorld();
		reportCollisions();
		
		last_simulation_time = _now;
	}
};

reportWorld = function() {
	var index, object,
		transform = new Ammo.btTransform(), origin, rotation,
		offset = 0,
		i = 0;
	
	if ( worldreport.length < 2 + _num_objects * WORLDREPORT_ITEMSIZE ) {
		worldreport = new Float32Array(worldreport.length + REPORT_CHUNKSIZE * WORLDREPORT_ITEMSIZE); // message id + # of objects to report + chunk size * # of values per object
		worldreport[0] = MESSAGE_TYPES.WORLDREPORT;
	}
	
	worldreport[1] = _num_objects; // record how many objects we're reporting on
	
	//for ( i = 0; i < worldreport[1]; i++ ) {
	for ( index in _objects ) {
		if ( _objects.hasOwnProperty( index ) ) {
			object = _objects[index];
			
			// #TODO: we can't use center of mass transform when center of mass can change,
			//        but getMotionState().getWorldTransform() screws up on objects that have been moved
			//object.getMotionState().getWorldTransform( transform );
			transform = object.getCenterOfMassTransform();
			
			origin = transform.getOrigin();
			rotation = transform.getRotation();
			
			// add values to report
			offset = 2 + (i++) * WORLDREPORT_ITEMSIZE;
			
			worldreport[ offset ] = object.id;
			
			worldreport[ offset + 1 ] = origin.x();
			worldreport[ offset + 2 ] = origin.y();
			worldreport[ offset + 3 ] = origin.z();
			
			worldreport[ offset + 4 ] = rotation.x();
			worldreport[ offset + 5 ] = rotation.y();
			worldreport[ offset + 6 ] = rotation.z();
			worldreport[ offset + 7 ] = rotation.w();
			
			_vector = object.getLinearVelocity();
			worldreport[ offset + 8 ] = _vector.x();
			worldreport[ offset + 9 ] = _vector.y();
			worldreport[ offset + 10 ] = _vector.z();
			
			_vector = object.getAngularVelocity();
			worldreport[ offset + 11 ] = _vector.x();
			worldreport[ offset + 12 ] = _vector.y();
			worldreport[ offset + 13 ] = _vector.z()
		}
	}
	
	transferableMessage( worldreport, [worldreport.buffer] );
};

reportCollisions = function() {
	var i, offset,
		dp = world.getDispatcher(),
		num = dp.getNumManifolds(),
		manifold, num_contacts, j, pt,
		_collided = false;
	
	if ( collisionreport.length < 2 + num * COLLISIONREPORT_ITEMSIZE ) {
		collisionreport = new Float32Array(collisionreport.length + REPORT_CHUNKSIZE * COLLISIONREPORT_ITEMSIZE); // message id + # of objects to report + chunk size * # of values per object
		collisionreport[0] = MESSAGE_TYPES.COLLISIONREPORT;
	}
	
	collisionreport[1] = 0; // how many collisions we're reporting on
	
	for ( i = 0; i < num; i++ ) {
		manifold = dp.getManifoldByIndexInternal( i );
		
		num_contacts = manifold.getNumContacts();
		if ( num_contacts == 0 ) continue;
		
		for ( j = 0; j < num_contacts; j++ ) {
			pt = manifold.getContactPoint( j );
			//if ( pt.getDistance() < 0 ) {
				offset = 2 + (collisionreport[1]++) * COLLISIONREPORT_ITEMSIZE;
				collisionreport[ offset ] = _objects_ammo[ manifold.getBody0() ];
				collisionreport[ offset + 1 ] = _objects_ammo[ manifold.getBody1() ];
				break;
			//}
		}
	}
	
	transferableMessage( collisionreport, [collisionreport.buffer] );
};

self.onmessage = function( event ) {
	
	if ( event.data instanceof Float32Array ) {
		// transferable object
		
		switch ( event.data[0] ) {
			case MESSAGE_TYPES.WORLDREPORT:
				worldreport = event.data;
				break;
			
			case MESSAGE_TYPES.COLLISIONREPORT:
				collisionreport = event.data;
				break;
		}
		
		return;
	}
	
	if ( event.data.cmd && public_functions[event.data.cmd] ) {
		if ( event.data.params.id !== undefined && _objects[event.data.params.id] === undefined && event.data.cmd !== 'addObject' && event.data.cmd !== 'registerMaterial' ) return;
		public_functions[event.data.cmd]( event.data.params );
	}
	
};