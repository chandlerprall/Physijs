'use strict';

var	// temp variables
	_object,
	_transform,
	
	// functions
	init,
	
	// World-specific functions
	setGravity,
	simulate,
	reportWorld,
	
	// Object-specific functions
	addObject,
	updateTransform,
	updateMass,
	applyCentralImpulse,
	applyImpulse,
	setAngularVelocity,
	setLinearVelocity,
	
	
	// world variables
	fixedTimeStep, // used when calling stepSimulation
	last_simulation_time, // store in *seconds*
	world,
	
	// private cache
	_now,
	_objects = [];


init = function( params ) {
	importScripts( params.ammo );
	_transform = new Ammo.btTransform;
	
	var collisionConfiguration = new Ammo.btDefaultCollisionConfiguration,
		dispatcher = new Ammo.btCollisionDispatcher( collisionConfiguration ),
		overlappingPairCache = new Ammo.btDbvtBroadphase,
		solver = new Ammo.btSequentialImpulseConstraintSolver
	
	world = new Ammo.btDiscreteDynamicsWorld( dispatcher, overlappingPairCache, solver, collisionConfiguration );
	
	fixedTimeStep = params.fixedTimeStep || 1 / 60;
};

setGravity = function( gravity ) {
	//if ( world && gravity && gravity.x && gravity.y && gravity.z ) {
		world.setGravity(new Ammo.btVector3( gravity.x, gravity.y, gravity.z ));
	//}
};

addObject = function( description ) {
	var localInertia, shape, motionState, rbInfo, body;
	
	_transform.setIdentity();
	
	localInertia = new Ammo.btVector3(0, 0, 0); // #TODO: localIntertia is the local inertia tensor, what does it do and should it be a parameter?
	
	switch ( description.type ) {
		case 'plane':
			shape = new Ammo.btStaticPlaneShape( new Ammo.btVector3( description.normal.x, description.normal.y, description.normal.z ) );
			break;
		
		case 'box':
			shape = new Ammo.btBoxShape(new Ammo.btVector3( description.width / 2, description.height / 2, description.depth / 2 ));
			break;
		
		case 'sphere':
			shape = new Ammo.btSphereShape( description.radius );
			break;
		
		case 'cylinder':
			shape = new Ammo.btCylinderShape(new Ammo.btVector3( description.width / 2, description.height / 2, description.depth / 2 ));
			break;
		
		case 'cone':
			shape = new Ammo.btConeShape( description.radius, description.height );
			break;
		
		case 'custom':
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
		
		case 'heightfield':
			var ptr = Ammo.allocate( description.heightfield.length*4, "float", Ammo.ALLOC_NORMAL );
			for ( var f = 0; f < description.heightfield.length; f++ ) {
				//Ammo.setValue(ptr+(f<<2), description.heightfield[f][1], 'float');
				Ammo.setValue(ptr+(f<<2), Math.random() * 5, 'float');
			}
			
			shape = new Ammo.btHeightfieldTerrainShape( description.datapoints_x, description.datapoints_y, ptr, 1, -20, 20, 1, 0, false );
			//shape.setUseDiamondSubdivision( true );
			
			var localScaling = new Ammo.btVector3( description.width / (description.datapoints_x - 1), 1, description.length / (description.datapoints_y - 1) );
			shape.setLocalScaling(localScaling);
			
			break;
		
		default:
			// Not recognized
			return;
			break;
	}
	
	shape.calculateLocalInertia( description.mass, localInertia );
	
	motionState = new Ammo.btDefaultMotionState( _transform ); // #TODO: btDefaultMotionState supports center of mass offset as second argument - implement
	rbInfo = new Ammo.btRigidBodyConstructionInfo( description.mass, motionState, shape, localInertia );
	
	if ( typeof description.friction !== 'undefined' ) rbInfo.set_m_friction( description.friction );
	if ( typeof description.restitution !== 'undefined' ) rbInfo.set_m_restitution( description.restitution );
	
	body = new Ammo.btRigidBody( rbInfo );
	
	if ( typeof description.collision_flags !== 'undefined' ) {
		body.setCollisionFlags( description.collision_flags );
	}
	
	world.addRigidBody( body );
	
	body.id = description.id;
	_objects[ body.id ] = body;
	
};

updateTransform = function( details ) {
	if ( _objects[details.id] ) {
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
	}
};

updateMass = function( details ) {
	// #TODO: changing a static object into dynamic is buggy
	if ( _objects[details.id] ) {
		_object = _objects[details.id];
		_object.setMassProps( details.mass, new Ammo.btVector3(0, 0, 0) );
		
		// Per http://www.bulletphysics.org/Bullet/phpBB3/viewtopic.php?p=&f=9&t=3663#p13816
		world.removeRigidBody( _object );
		world.addRigidBody( _object );
		_object.activate();
	}
};

applyCentralImpulse = function ( details ) {
	if ( details.id && _objects[details.id] ) {
		_objects[details.id].applyCentralImpulse(new Ammo.btVector3( details.x, details.y, details.z ));
		_objects[details.id].activate();
	}
};

applyImpulse = function ( details ) {
	if ( details.id && _objects[details.id] ) {
		_objects[details.id].applyImpulse(
			new Ammo.btVector3( details.impulse_x, details.impulse_y, details.impulse_z ),
			new Ammo.btVector3( details.x, details.y, details.z )
		);
		_objects[details.id].activate();
	}
};

setAngularVelocity = function ( details ) {
	if ( details.id && _objects[details.id] ) {
		_objects[details.id].setAngularVelocity(
			new Ammo.btVector3( details.x, details.y, details.z )
		);
		_objects[details.id].activate();
	}
};

setLinearVelocity = function ( details ) {
	if ( details.id && _objects[details.id] ) {
		_objects[details.id].setLinearVelocity(
			new Ammo.btVector3( details.x, details.y, details.z )
		);
		_objects[details.id].activate();
	}
};

simulate = function( params ) {
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
		
		last_simulation_time = _now;
	}
};

reportWorld = function() {
	var index, report = [], object,
		transform = new Ammo.btTransform(), origin, rotation;
	
	for ( index in _objects ) {
		if ( _objects.hasOwnProperty( index ) ) {
			object = _objects[index];
			
			// #TODO: we can't use center of mass transform when center of mass can change,
			//        but getMotionState().getWorldTransform() screws up on objects that have been moved
			//object.getMotionState().getWorldTransform( transform );
			transform = object.getCenterOfMassTransform();
			
			origin = transform.getOrigin();
			rotation = transform.getRotation();
			
			report.push(
				{
					id: object.id,
					
					pos_x: origin.x(),
					pos_y: origin.y(),
					pos_z: origin.z(),
					
					quat_x: rotation.x(),
					quat_y: rotation.y(),
					quat_z: rotation.z(),
					quat_w: rotation.w()
				}
			);
		}
	}
	
	self.postMessage({ cmd: 'update', params: { objects: report } });
};


self.onmessage = function( event ) {
	
	switch ( event.data.cmd ) {
		
		case 'init':
			init( event.data.params || {} );
			break;
		
		case 'addObject':
			if ( event.data.params && event.data.params.description ) {
				addObject( event.data.params.description );
			}
			break;
		
		case 'updateTransform':
			if ( event.data.params ) {
				updateTransform( event.data.params );
			}
			break;
		
		case 'updateMass':
			if ( event.data.params ) {
				updateMass( event.data.params );
			}
			break;
		
		case 'applyCentralImpulse':
			if ( event.data.params ) {
				applyCentralImpulse( event.data.params );
			}
			break;
		
		case 'applyImpulse':
			if ( event.data.params ) {
				applyImpulse( event.data.params );
			}
			break;
		
		case 'setAngularVelocity':
			if ( event.data.params ) {
				setAngularVelocity( event.data.params );
			}
			break;
		
		case 'setLinearVelocity':
			if ( event.data.params ) {
				setAngularVelocity( event.data.params );
			}
			break;
		
		case 'setGravity':
			if ( event.data.params && event.data.params.gravity ) {
				setGravity( event.data.params.gravity );
			}
			break;
		
		case 'simulate':
			simulate( event.data.params || {} );
			break;
		
		default:
			// Do nothing
			break;
		
	}
	
};