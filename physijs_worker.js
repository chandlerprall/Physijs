'use strict';

var	
	transferableMessage = self.webkitPostMessage || self.postMessage,
	
	// enum
	MESSAGE_TYPES = {
		WORLDREPORT: 0,
		COLLISIONREPORT: 1,
		VEHICLEREPORT: 2,
		CONSTRAINTREPORT: 3
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
	reportVehicles,
	reportCollisions,
	reportConstraints,
	
	// world variables
	fixedTimeStep, // used when calling stepSimulation
	rateLimit, // sets whether or not to sync the simulation rate with fixedTimeStep
	last_simulation_time,
	last_simulation_duration = 0,
	world,
	
	// private cache
	_objects = {},
	_vehicles = {},
	_constraints = {},
	_materials = {},
	_objects_ammo = {},
	_num_objects = 0,
	_num_wheels = 0,
	_num_constraints = 0,
	_object_shapes = {},
	
	// object reporting
	REPORT_CHUNKSIZE, // report array is increased in increments of this chunk size
	
	WORLDREPORT_ITEMSIZE = 14, // how many float values each reported item needs
	worldreport,

	COLLISIONREPORT_ITEMSIZE = 2, // one float for each object id
	collisionreport,

	VEHICLEREPORT_ITEMSIZE = 9, // vehicle id, wheel index, 3 for position, 4 for rotation
	vehiclereport,

	CONSTRAINTREPORT_ITEMSIZE = 6, // constraint id, offset object, offset, applied impulse
	constraintreport;

var ab = new ArrayBuffer( 1 );
transferableMessage( ab, [ab] );
var SUPPORT_TRANSFERABLE = ( ab.byteLength === 0 );

getShapeFromCache = function ( cache_key ) {
	if ( _object_shapes[ cache_key ] !== undefined ) {
		return _object_shapes[ cache_key ];
	}
	return null;
};

setShapeCache = function ( cache_key, shape ) {
	_object_shapes[ cache_key ] = shape;
};

createShape = function( description ) {
	var cache_key, shape;
	
	switch ( description.type ) {
		/*case 'plane':
			cache_key = 'plane_' + description.normal.x + '_' + description.normal.y + '_' + description.normal.z;
			if ( ( shape = getShapeFromCache( cache_key ) ) === null ) {
				shape = new Ammo.btStaticPlaneShape( new Ammo.btVector3( description.normal.x, description.normal.y, description.normal.z ), 0 );
				setShapeCache( cache_key, shape );
			}
			break;*/
		
		case 'box':
			cache_key = 'box_' + description.width + '_' + description.height + '_' + description.depth;
			if ( ( shape = getShapeFromCache( cache_key ) ) === null ) {
				shape = new Goblin.BoxShape( description.width / 2, description.height / 2, description.depth / 2 );
				setShapeCache( cache_key, shape );
			}
			break;
		
		case 'sphere':
			cache_key = 'sphere_' + description.radius;
			if ( ( shape = getShapeFromCache( cache_key ) ) === null ) {
				shape = new Goblin.SphereShape( description.radius );
				setShapeCache( cache_key, shape );
			}
			break;
		
		/*case 'cylinder':
			cache_key = 'cylinder_' + description.width + '_' + description.height + '_' + description.depth;
			if ( ( shape = getShapeFromCache( cache_key ) ) === null ) {
				shape = new Ammo.btCylinderShape(new Ammo.btVector3( description.width / 2, description.height / 2, description.depth / 2 ));
				setShapeCache( cache_key, shape );
			}
			break;*/
		
		/*case 'capsule':
			cache_key = 'capsule_' + description.radius + '_' + description.height;
			if ( ( shape = getShapeFromCache( cache_key ) ) === null ) {
				// In Bullet, capsule height excludes the end spheres
				shape = new Ammo.btCapsuleShape( description.radius, description.height - 2 * description.radius );
				setShapeCache( cache_key, shape );
			}
			break;*/
		
		/*case 'cone':
			cache_key = 'cone_' + description.radius + '_' + description.height;
			if ( ( shape = getShapeFromCache( cache_key ) ) === null ) {
				shape = new Ammo.btConeShape( description.radius, description.height );
				setShapeCache( cache_key, shape );
			}
			break;*/
		
		/*case 'concave':
			var i, triangle, triangle_mesh = new Ammo.btTriangleMesh;
			if (!description.triangles.length) return false

			for ( i = 0; i < description.triangles.length; i++ ) {
				triangle = description.triangles[i];
				triangle_mesh.addTriangle(
					new Ammo.btVector3( triangle[0].x, triangle[0].y, triangle[0].z ),
					new Ammo.btVector3( triangle[1].x, triangle[1].y, triangle[1].z ),
					new Ammo.btVector3( triangle[2].x, triangle[2].y, triangle[2].z ),
					true
				);
			}

			shape = new Ammo.btBvhTriangleMeshShape(
				triangle_mesh,
				true,
				true
			);
			
			break;*/
		
		/*case 'convex':
			var i, point, shape = new Ammo.btConvexHullShape;
			for ( i = 0; i < description.points.length; i++ ) {
				point = description.points[i];
				shape.addPoint( new Ammo.btVector3( point.x, point.y, point.z ) );
			}
			break;*/

		/*case 'heightfield':

			var ptr = Ammo.allocate(4 * description.xpts * description.ypts, "float", Ammo.ALLOC_NORMAL);

			for (var f = 0; f < description.points.length; f++) {
				Ammo.setValue(ptr + f,  description.points[f]  , 'float');
			}

			shape = new Ammo.btHeightfieldTerrainShape(
					description.xpts,
					description.ypts,
					ptr,
					1,
					-description.absMaxHeight,
					description.absMaxHeight,
					2,
					0,
					false
				);

			var localScaling = new Ammo.btVector3(description.xsize/(description.xpts - 1),description.ysize/(description.ypts - 1),1);
			shape.setLocalScaling(localScaling);
			break;*/
		
		default:
			// Not recognized
			return;
	}
	
	return shape;
};

public_functions.init = function( params ) {
	importScripts( params.glMatrix );
	importScripts( params.goblin );
	
	REPORT_CHUNKSIZE = params.reportsize || 50;
	if ( SUPPORT_TRANSFERABLE ) {
		// Transferable messages are supported, take advantage of them with TypedArrays
		worldreport = new Float32Array(2 + REPORT_CHUNKSIZE * WORLDREPORT_ITEMSIZE); // message id + # of objects to report + chunk size * # of values per object
		collisionreport = new Float32Array(2 + REPORT_CHUNKSIZE * COLLISIONREPORT_ITEMSIZE); // message id + # of collisions to report + chunk size * # of values per object
		vehiclereport = new Float32Array(2 + REPORT_CHUNKSIZE * VEHICLEREPORT_ITEMSIZE); // message id + # of vehicles to report + chunk size * # of values per object
		constraintreport = new Float32Array(2 + REPORT_CHUNKSIZE * CONSTRAINTREPORT_ITEMSIZE); // message id + # of constraints to report + chunk size * # of values per object
	} else {
		// Transferable messages are not supported, send data as normal arrays
		worldreport = [];
		collisionreport = [];
		vehiclereport = [];
		constraintreport = [];
	}
	worldreport[0] = MESSAGE_TYPES.WORLDREPORT;
	collisionreport[0] = MESSAGE_TYPES.COLLISIONREPORT;
	vehiclereport[0] = MESSAGE_TYPES.VEHICLEREPORT;
	constraintreport[0] = MESSAGE_TYPES.CONSTRAINTREPORT;
	
	var nearphase = new Goblin.NearPhase(),
		solver = new Goblin.SequentialImpulseSolver(),
		broadphase;
	
	if ( !params.broadphase ) params.broadphase = { type: 'dynamic' };
	switch ( params.broadphase.type ) {
		/*case 'sweepprune':
			broadphase = new Ammo.btAxisSweep3(
				new Ammo.btVector3( params.broadphase.aabbmin.x, params.broadphase.aabbmin.y, params.broadphase.aabbmax.z ),
				new Ammo.btVector3( params.broadphase.aabbmax.x, params.broadphase.aabbmax.y, params.broadphase.aabbmax.z )
			);
			break;*/
		
		case 'dynamic':
		default:
			broadphase = new Goblin.BasicBroadphase();
			break;
	}
	
	world = new Goblin.World( broadphase, nearphase, solver );
	
	fixedTimeStep = params.fixedTimeStep;
	rateLimit = params.rateLimit;

	transferableMessage({ cmd: 'worldReady' });
};

public_functions.registerMaterial = function( description ) {
	_materials[ description.id ] = description;
};

public_functions.setFixedTimeStep = function( description ) {
	fixedTimeStep = description;
};

public_functions.setGravity = function( description ) {
	world.gravity[0] = description.x;
	world.gravity[1] = description.y;
	world.gravity[2] = description.z;
};

public_functions.addObject = function( description ) {
	var i, shape, body;
	
	shape = createShape( description );
	if ( !shape ) {
		return;
	}
	// If there are children then this is a compound shape
	if ( description.children ) {
		throw 'Compound objects not supported';
		/*var compound_shape = new Ammo.btCompoundShape, _child;
		compound_shape.addChildShape( _transform, shape );
		
		for ( i = 0; i < description.children.length; i++ ) {
			_child = description.children[i];
			var trans = new Ammo.btTransform;
			trans.setIdentity();
			trans.setOrigin(new Ammo.btVector3( _child.position_offset.x, _child.position_offset.y, _child.position_offset.z ));
			trans.setRotation(new Ammo.btQuaternion( _child.rotation.x, _child.rotation.y, _child.rotation.z, _child.rotation.w ));
			
			shape = createShape( description.children[i] );
			compound_shape.addChildShape( trans, shape );
		}
		
		shape = compound_shape;*/
	}

	body = new Goblin.RigidBody( shape, description.mass );

	body.position[0] = description.position.x;
	body.position[1] = description.position.y;
	body.position[2] = description.position.z;

	body.rotation[0] = description.rotation.x;
	body.rotation[1] = description.rotation.y;
	body.rotation[2] = description.rotation.z;
	body.rotation[3] = description.rotation.w;
	
	if ( description.materialId !== undefined ) {
		body.friction = _materials[ description.materialId ].friction;
		body.restitution = _materials[ description.materialId ].restitution;
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
	
	if ( details.pos ) {
		_object.position[0] = details.pos.x;
		_object.position[1] = details.pos.y;
		_object.position[2] = details.pos.z;
	}
	
	if ( details.quat ) {
		_object.rotation[0] = details.quat.x;
		_object.rotation[1] = details.quat.y;
		_object.rotation[2] = details.quat.z;
		_object.rotation[3] = details.quat.w;
	}
};

public_functions.updateMass = function( details ) {
	_object = _objects[details.id];

	_object.mass = details.mass;
	_object.inertiaTensor = _object.shape.getInertiaTensor( details.mass );
};

public_functions.applyCentralImpulse = function ( details ) {
	_object = _objects[details.id];
	var mass = _object.mass;
	_object.applyForce([ details.x * mass, details.y * mass, details.z * mass ]);
};

public_functions.applyImpulse = function ( details ) {
	_object = _objects[details.id];
	var mass = _object.mass;
	_object.applyForceAtWorldPoint(
		[ details.impulse_x * mass, details.impulse_y * mass, details.impulse_z * mass ],
		[ details.x, details.y, details.z ]
	);
};

public_functions.applyCentralForce = function ( details ) {
	_objects[details.id].applyForce([ details.x, details.y, details.z ]);
};

public_functions.applyForce = function ( details ) {
	_objects[details.id].applyForceAtWorldPoint(
		[ details.force_x, details.force_y, details.force_z ],
		[ details.x, details.y, details.z ]
	);
};

public_functions.setAngularVelocity = function ( details ) {
	_object = _objects[details.id];
	_object.angular_velocity[0] = details.x;
	_object.angular_velocity[1] = details.y;
	_object.angular_velocity[2] = details.z;
};

public_functions.setLinearVelocity = function ( details ) {
	_object = _objects[details.id];
	_object.linear_velocity[0] = details.x;
	_object.linear_velocity[1] = details.y;
	_object.linear_velocity[2] = details.z;
};

public_functions.setAngularFactor = function ( details ) {
	_object = _objects[details.id];
	_object.angular_damping[0] = details.x;
	_object.angular_damping[1] = details.y;
	_object.angular_damping[2] = details.z;
};

public_functions.setLinearFactor = function ( details ) {
	_object = _objects[details.id];
	_object.linear_damping[0] = details.x;
	_object.linear_damping[1] = details.y;
	_object.linear_damping[2] = details.z;
};

public_functions.simulate = function simulate( params ) {
	if ( world ) {
		params = params || {};

		if ( !params.timeStep ) {
			if ( last_simulation_time ) {
				params.timeStep = 0;
				while ( params.timeStep + last_simulation_duration <= fixedTimeStep ) {
					params.timeStep = ( Date.now() - last_simulation_time ) / 1000; // time since last simulation
				}
			} else {
				params.timeStep = fixedTimeStep; // handle first frame
			}
		} else {
			if ( params.timeStep < fixedTimeStep ) {
				params.timeStep = fixedTimeStep;
			}
		}

		last_simulation_duration = Date.now();
		world.step( fixedTimeStep );
		//reportVehicles();
		//reportCollisions();
		//reportConstraints();
		reportWorld();
		last_simulation_duration = ( Date.now() - last_simulation_duration ) / 1000;

		last_simulation_time = Date.now();
	}
};

reportWorld = function() {
	var index, object,
		offset = 0,
		i = 0;
	
	if ( SUPPORT_TRANSFERABLE ) {
		if ( worldreport.length < 2 + _num_objects * WORLDREPORT_ITEMSIZE ) {
			worldreport = new Float32Array(
				2 + // message id & # objects in report
				( Math.ceil( _num_objects / REPORT_CHUNKSIZE ) * REPORT_CHUNKSIZE ) * WORLDREPORT_ITEMSIZE // # of values needed * item size
			);
			worldreport[0] = MESSAGE_TYPES.WORLDREPORT;
		}
	}
	
	worldreport[1] = _num_objects; // record how many objects we're reporting on

	//for ( i = 0; i < worldreport[1]; i++ ) {
	for ( index in _objects ) {
		if ( _objects.hasOwnProperty( index ) ) {
			object = _objects[index];
			
			// add values to report
			offset = 2 + (i++) * WORLDREPORT_ITEMSIZE;
			
			worldreport[ offset ] = object.id;
			
			worldreport[ offset + 1 ] = object.position[0];
			worldreport[ offset + 2 ] = object.position[1];
			worldreport[ offset + 3 ] = object.position[2];
			
			worldreport[ offset + 4 ] = object.rotation[0];
			worldreport[ offset + 5 ] = object.rotation[1];
			worldreport[ offset + 6 ] = object.rotation[2];
			worldreport[ offset + 7 ] = object.rotation[3];

			worldreport[ offset + 8 ] = object.linear_velocity[0];
			worldreport[ offset + 9 ] = object.linear_velocity[1];
			worldreport[ offset + 10 ] = object.linear_velocity[2];

			worldreport[ offset + 11 ] = object.angular_velocity[0];
			worldreport[ offset + 12 ] = object.angular_velocity[1];
			worldreport[ offset + 13 ] = object.angular_velocity[2];
		}
	}

	if ( SUPPORT_TRANSFERABLE ) {
		transferableMessage( worldreport.buffer, [worldreport.buffer] );
	} else {
		transferableMessage( worldreport );
	}
};

/*reportCollisions = function() {
	var i, offset,
		dp = world.getDispatcher(),
		num = dp.getNumManifolds(),
		manifold, num_contacts, j, pt,
		_collided = false;

	if ( SUPPORT_TRANSFERABLE ) {
		if ( collisionreport.length < 2 + num * COLLISIONREPORT_ITEMSIZE ) {
			collisionreport = new Float32Array(
				2 + // message id & # objects in report
				( Math.ceil( _num_objects / REPORT_CHUNKSIZE ) * REPORT_CHUNKSIZE ) * COLLISIONREPORT_ITEMSIZE // # of values needed * item size
			);
			collisionreport[0] = MESSAGE_TYPES.COLLISIONREPORT;
		}
	}

	collisionreport[1] = 0; // how many collisions we're reporting on

	for ( i = 0; i < num; i++ ) {
		manifold = dp.getManifoldByIndexInternal( i );

		num_contacts = manifold.getNumContacts();
		if ( num_contacts === 0 ) {
			continue;
		}

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

	if ( SUPPORT_TRANSFERABLE ) {
		transferableMessage( collisionreport.buffer, [collisionreport.buffer] );
	} else {
		transferableMessage( collisionreport );
	}
};*/

/*reportVehicles = function() {
	var index, vehicle,
		transform = new Ammo.btTransform, origin, rotation,
		offset = 0,
		i = 0, j = 0;

	if ( SUPPORT_TRANSFERABLE ) {
		if ( vehiclereport.length < 2 + _num_wheels * VEHICLEREPORT_ITEMSIZE ) {
			vehiclereport = new Float32Array(
				2 + // message id & # objects in report
				( Math.ceil( _num_wheels / REPORT_CHUNKSIZE ) * REPORT_CHUNKSIZE ) * VEHICLEREPORT_ITEMSIZE // # of values needed * item size
			);
			vehiclereport[0] = MESSAGE_TYPES.VEHICLEREPORT;
		}
	}

	for ( index in _vehicles ) {
		if ( _vehicles.hasOwnProperty( index ) ) {
			vehicle = _vehicles[index];

			for ( j = 0; j < vehicle.getNumWheels(); j++ ) {

				//vehicle.updateWheelTransform( j, true );

				//transform = vehicle.getWheelTransformWS( j );
				transform = vehicle.getWheelInfo( j ).get_m_worldTransform();

				origin = transform.getOrigin();
				rotation = transform.getRotation();

				// add values to report
				offset = 1 + (i++) * VEHICLEREPORT_ITEMSIZE;

				vehiclereport[ offset ] = index;
				vehiclereport[ offset + 1 ] = j;

				vehiclereport[ offset + 2 ] = origin.x();
				vehiclereport[ offset + 3 ] = origin.y();
				vehiclereport[ offset + 4 ] = origin.z();

				vehiclereport[ offset + 5 ] = rotation.x();
				vehiclereport[ offset + 6 ] = rotation.y();
				vehiclereport[ offset + 7 ] = rotation.z();
				vehiclereport[ offset + 8 ] = rotation.w();

			}

		}
	}

	if ( j !== 0 ) {
		if ( SUPPORT_TRANSFERABLE ) {
			transferableMessage( vehiclereport.buffer, [vehiclereport.buffer] );
		} else {
			transferableMessage( vehiclereport );
		}
	}
};*/

/*reportConstraints = function() {
	var index, constraint,
		offset_body,
		transform = new Ammo.btTransform, origin,
		offset = 0,
		i = 0;

	if ( SUPPORT_TRANSFERABLE ) {
		if ( constraintreport.length < 2 + _num_constraints * CONSTRAINTREPORT_ITEMSIZE ) {
			constraintreport = new Float32Array(
				2 + // message id & # objects in report
				( Math.ceil( _num_constraints / REPORT_CHUNKSIZE ) * REPORT_CHUNKSIZE ) * CONSTRAINTREPORT_ITEMSIZE // # of values needed * item size
			);
			constraintreport[0] = MESSAGE_TYPES.CONSTRAINTREPORT;
		}
	}

	for ( index in _constraints ) {
		if ( _constraints.hasOwnProperty( index ) ) {
			constraint = _constraints[index];
			offset_body = constraint.getRigidBodyA();
			transform = constraint.getFrameOffsetA();
			origin = transform.getOrigin();

			// add values to report
			offset = 1 + (i++) * CONSTRAINTREPORT_ITEMSIZE;

			constraintreport[ offset ] = index;
			constraintreport[ offset + 1 ] = offset_body.id;
			constraintreport[ offset + 2 ] = origin.getX();
			constraintreport[ offset + 3 ] = origin.getY();
			constraintreport[ offset + 4 ] = origin.getZ();
			constraintreport[ offset + 5 ] = constraint.getAppliedImpulse();
		}
	}

	if ( i !== 0 ) {
		if ( SUPPORT_TRANSFERABLE ) {
			transferableMessage( constraintreport.buffer, [constraintreport.buffer] );
		} else {
			transferableMessage( constraintreport );
		}
	}
};*/

self.onmessage = function( event ) {
	
	if ( event.data instanceof Float32Array ) {
		// transferable object
		
		switch ( event.data[0] ) {
			case MESSAGE_TYPES.WORLDREPORT:
				worldreport = new Float32Array( event.data );
				break;

			case MESSAGE_TYPES.COLLISIONREPORT:
				collisionreport = new Float32Array( event.data );
				break;

			case MESSAGE_TYPES.VEHICLEREPORT:
				vehiclereport = new Float32Array( event.data );
				break;

			case MESSAGE_TYPES.CONSTRAINTREPORT:
				constraintreport = new Float32Array( event.data );
				break;
		}
		
		return;
	}
	
	if ( event.data.cmd && public_functions[event.data.cmd] ) {
		//if ( event.data.params.id !== undefined && _objects[event.data.params.id] === undefined && event.data.cmd !== 'addObject' && event.data.cmd !== 'registerMaterial' ) return;
		public_functions[event.data.cmd]( event.data.params );
	}
	
};
