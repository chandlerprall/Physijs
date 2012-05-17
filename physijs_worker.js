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
	_quaternion,
	
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
	
	switch ( description.type ) {
		case 'plane':
			cache_key = 'plane_' + description.normal.x + '_' + description.normal.y + '_' + description.normal.z;
			if ( ( shape = getShapeFromCache( cache_key ) ) === null ) {
				shape = new CANNON.Plane( new CANNON.Vec3( description.normal.x, description.normal.y, description.normal.z ) );
				setShapeCache( cache_key, shape );
			}
			break;
		
		case 'box':
			cache_key = 'box_' + description.width + '_' + description.height + '_' + description.depth;
			if ( ( shape = getShapeFromCache( cache_key ) ) === null ) {
				shape = new CANNON.Box(new CANNON.Vec3( description.width / 2, description.height / 2, description.depth / 2 ) );
				setShapeCache( cache_key, shape );
			}
			break;
		
		case 'sphere':
			cache_key = 'sphere_' + description.radius;
			if ( ( shape = getShapeFromCache( cache_key ) ) === null ) {
				shape = new CANNON.Sphere( description.radius );
				setShapeCache( cache_key, shape );
			}
			break;
		/*
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
		*/
		
		case 'convex':
			var i, point, shape = new CANNON.ConvexHull;
			var points = [];
			var normals = [];
			
			for ( i = 0; i < description.points.length; i++ ) {
				point = description.points[i];
				points.push(
					new CANNON.Vec3( point.x, point.y, point.z )
				);
			}
			
			for ( i = 0; i < description.normals.length; i++ ) {
				point = description.normals[i];
				normals.push(
					new CANNON.Vec3( point.x, point.y, point.z )
				);
			}
			
			shape.addPoints(
				points,
				description.faces,
				normals
			);
			
			break;
		
		default:
			// Not recognized
			return;
			break;
	}
	
	return shape;
};

public_functions.init = function( params ) {
	importScripts( params.cannon );
	
	_vector = new CANNON.Vec3;
	_quaternion = new CANNON.Quaternion;
	
	REPORT_CHUNKSIZE = params.reportsize || 5;
	worldreport = new Float32Array(2 + REPORT_CHUNKSIZE * WORLDREPORT_ITEMSIZE); // message id + # of objects to report + chunk size * # of values per object
	worldreport[0] = MESSAGE_TYPES.WORLDREPORT;
	
	collisionreport = new Float32Array(2 + REPORT_CHUNKSIZE * WORLDREPORT_ITEMSIZE); // message id + # of collisions to report + chunk size * # of values per object
	collisionreport[0] = MESSAGE_TYPES.COLLISIONREPORT;
	
	world = new CANNON.World;
	world.broadphase = new CANNON.NaiveBroadphase;
	
	fixedTimeStep = params.fixedTimeStep || 1 / 60;
};

public_functions.registerMaterial = function( description ) {
	_materials[ description.id ] = description;
};

public_functions.setGravity = function( description ) {
	world.gravity.set( description.x, description.y, description.z );
};

public_functions.addObject = function( description ) {
	var shape, body;
	
	shape = createShape( description );
	
	// If there are children then this is a compound shape
	if ( description.children ) {
		var compound_shape = new CANNON.Compound, _child;
		compound_shape.addChild( shape );
		
		for ( i = 0; i < description.children.length; i++ ) {
			_child = description.children[i];
			shape = createShape( description.children[i] );
			compound_shape.addChildShape( shape, _child.offset, _child.rotation );
		}
		
		shape = compound_shape;
	}
	
	/*
	if ( description.materialId !== undefined ) {
		rbInfo.set_m_friction( _materials[ description.materialId ].friction );
		rbInfo.set_m_restitution( _materials[ description.materialId ].restitution );
	}
	*/
	
	body = new CANNON.RigidBody( description.mass, shape );
	
	body.position.set( description.position.x, description.position.y, description.position.z );
	body.quaternion.set( description.rotation.x, description.rotation.y, description.rotation.z, description.rotation.w );
	
	world.add( body );
	
	body.id = description.id;
	_objects[ body.id ] = body;
	_num_objects++;
	
	transferableMessage({ cmd: 'objectReady', params: body.id });
};

public_functions.removeObject = function( details ) {
	world.remove( _objects[details.id] );
	delete _objects[details.id];
	_num_objects--;
};

public_functions.updatePosition = function( details ) {
	_objects[details.id].position.set( details.x, details.y, details.z );
};

public_functions.updateRotation = function( details ) {
	_objects[details.id].quaternion.set( details.x, details.y, details.z, details.w );
};

public_functions.updateMass = function( details ) {
	_objects[details.id].mass( details.mass );
	_objects[details.id].calculateLocalInertia( details.mass );
	
};
/*
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
*/
public_functions.setAngularVelocity = function ( details ) {
	_objects[details.id].angularVelocity.set( details.x, details.y, details.z );
};

public_functions.setLinearVelocity = function ( details ) {
	_objects[details.id].velocity.set( details.x, details.y, details.z );
};
/*
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
*/
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
		
		world.solver.iterations = params.maxSubSteps;
		world.step( params.timeStep );
		reportWorld();
		reportCollisions();
		
		last_simulation_time = _now;
	}
};

reportWorld = function() {
	var index, object,
		report = [], i = 0, offset = 0,
		origin, rotation;
	
	if ( worldreport.length < 2 + _num_objects * WORLDREPORT_ITEMSIZE ) {
		worldreport = new Float32Array(worldreport.length + REPORT_CHUNKSIZE * WORLDREPORT_ITEMSIZE); // message id + # of objects to report + chunk size * # of values per object
		worldreport[0] = MESSAGE_TYPES.WORLDREPORT;
	}
	
	worldreport[1] = _num_objects; // record how many objects we're reporting on
	
	for ( index in _objects ) {
		if ( _objects.hasOwnProperty( index ) ) {
			object = _objects[index];
			
			// add values to report
			offset = 2 + (i++) * WORLDREPORT_ITEMSIZE;
			
			worldreport[ offset ] = object.id;
			
			worldreport[ offset + 1 ] = object.position.x;
			worldreport[ offset + 2 ] = object.position.y;
			worldreport[ offset + 3 ] = object.position.z;
			
			worldreport[ offset + 4 ] = object.quaternion.x;
			worldreport[ offset + 5 ] = object.quaternion.y;
			worldreport[ offset + 6 ] = object.quaternion.z;
			worldreport[ offset + 7 ] = object.quaternion.w;
			
			worldreport[ offset + 8 ] = object.velocity.x;
			worldreport[ offset + 9 ] = object.velocity.y;
			worldreport[ offset + 10 ] = object.velocity.z;
			
			worldreport[ offset + 11 ] = object.angularVelocity.x;
			worldreport[ offset + 12 ] = object.angularVelocity.y;
			worldreport[ offset + 13 ] = object.angularVelocity.z
		}
	}
	
	transferableMessage( worldreport, [worldreport.buffer] );
};

reportCollisions = function() {
	var i, offset, number_of_contacts,
		contact, contact_objects;
	
	// #TODO: don't loop over world.contacts twice
	for ( contact in world.contacts ) {
		if ( world.contacts.hasOwnProperty( contact ) ) {
			number_of_contacts++;
		}
	}
	
	if ( collisionreport.length < 2 + number_of_contacts * COLLISIONREPORT_ITEMSIZE ) {
		collisionreport = new Float32Array(collisionreport.length + REPORT_CHUNKSIZE * COLLISIONREPORT_ITEMSIZE); // message id + # of objects to report + chunk size * # of values per object
		collisionreport[0] = MESSAGE_TYPES.COLLISIONREPORT;
	}
	
	collisionreport[1] = 0; // how many collisions we're reporting on
	
	for ( contact in world.contacts ) {
		if ( world.contacts.hasOwnProperty( contact ) ) {
			offset = 2 + (collisionreport[1]++) * COLLISIONREPORT_ITEMSIZE;
			contact_objects = contact.split(',');
			collisionreport[ offset ] = parseInt( contact_objects[0], 10 );
			collisionreport[ offset + 1 ] = parseInt( contact_objects[1], 10 );
		}
	}
	
	//transferableMessage( collisionreport, [collisionreport.buffer] );
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
	
	if ( public_functions[event.data.cmd] ) {
		if ( event.data.params.id !== undefined && _objects[event.data.params.id] === undefined && event.data.cmd !== 'addObject' ) return;
		public_functions[event.data.cmd]( event.data.params );
	}
	
};