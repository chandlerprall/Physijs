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
	reportWorld,
	reportCollisions,
	
	// world variables
	fixedTimeStep, // used when calling stepSimulation
	last_simulation_time, // store in *seconds*
	world,
	
	// private cache
	_now,
	_objects = [],
	
	// object reporting
	REPORT_CHUNKSIZE, // report array is increased in increments of this chunk size
	
	WORLDREPORT_ITEMSIZE = 14, // how many float values each reported item needs
	worldreport,
	
	COLLISIONREPORT_ITEMSIZE = 2, // one float for each object id
	collisionreport;


public_functions.init = function( params ) {
	importScripts( params.cannon );
	
	_vector = new CANNON.Vec3;
	_quaternion = new CANNON.Quaternion;
	
	REPORT_CHUNKSIZE = params.reportsize || 5;
	worldreport = new Float32Array(2 + REPORT_CHUNKSIZE * WORLDREPORT_ITEMSIZE); // message id + # of objects to report + chunk size * # of values per object
	worldreport[0] = MESSAGE_TYPES.WORLDREPORT;
	
	collisionreport = new Float32Array(2 + REPORT_CHUNKSIZE * WORLDREPORT_ITEMSIZE); // message id + # of collisions to report + chunk size * # of values per object
	collisionreport[0] = MESSAGE_TYPES.COLLISIONREPORT;
	
	var bp = new CANNON.NaiveBroadphase;
	
	world = new CANNON.World
	world.broadphase( bp );
	
	fixedTimeStep = params.fixedTimeStep || 1 / 60;
};

public_functions.setGravity = function( description ) {
	world.gravity( description );
};

public_functions.addObject = function( description ) {
	var shape, body;
	
	switch ( description.type ) {
		case 'plane':
			shape = new CANNON.Plane( new CANNON.Vec3( description.normal.x, description.normal.y, description.normal.z ) );
			break;
		
		case 'box':
			description.width /= 2;
			description.height /= 2;
			description.depth /= 2;
			shape = new CANNON.Box(new CANNON.Vec3( description.width, description.height, description.depth ) );
			break;
		
		case 'sphere':
			shape = new CANNON.Sphere( description.radius );
			break;
		/*
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
		*/
		default:
			// Not recognized
			return;
			break;
	}
	
	//if ( typeof description.friction !== 'undefined' ) rbInfo.set_m_friction( description.friction );
	//if ( typeof description.restitution !== 'undefined' ) rbInfo.set_m_restitution( description.restitution );
	
	body = new CANNON.RigidBody( description.mass, shape );
	
	world.add( body );
	
	body.id = description.id;
	_objects[ body.id ] = body;
};

public_functions.removeObject = function( details ) {
	throw 'Object removal not supported';
	//world.removeRigidBody( _objects[details.id] );
	//delete _objects[details.id];
};

public_functions.updatePosition = function( details ) {
	_objects[details.id].setPosition( details.x, details.y, details.z );
};

public_functions.updateRotation = function( details ) {
	_objects[details.id].setOrientation( details.x, details.y, details.z, details.w );
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
	_objects[details.id].setAngularVelocity( details.x, details.y, details.z );
};

public_functions.setLinearVelocity = function ( details ) {
	_objects[details.id].setVelocity( details.x, details.y, details.z );
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
		
		world.iterations( params.maxSubSteps );
		world.step( params.timeStep );
		reportWorld();
		reportCollisions();
		
		last_simulation_time = _now;
	}
};

reportWorld = function() {
	var i, object,
		report = [], offset = 0,
		origin, rotation;
	
	if ( worldreport.length < 2 + _objects.length * WORLDREPORT_ITEMSIZE ) {
		worldreport = new Float32Array(worldreport.length + REPORT_CHUNKSIZE * WORLDREPORT_ITEMSIZE); // message id + # of objects to report + chunk size * # of values per object
		worldreport[0] = MESSAGE_TYPES.WORLDREPORT;
	}
	
	worldreport[1] = _objects.length; // record how many objects we're reporting on
	
	for ( i = 0; i < worldreport[1]; i++ ) {
		object = _objects[i];
		
		// add values to report
		offset = 2 + i * WORLDREPORT_ITEMSIZE;
		
		worldreport[ offset ] = object.id;
		
		object.getPosition( _vector );
		worldreport[ offset + 1 ] = _vector.x;
		worldreport[ offset + 2 ] = _vector.y;
		worldreport[ offset + 3 ] = _vector.z;
		
		object.getOrientation( _quaternion );
		worldreport[ offset + 4 ] = _quaternion.x;
		worldreport[ offset + 5 ] = _quaternion.y;
		worldreport[ offset + 6 ] = _quaternion.z;
		worldreport[ offset + 7 ] = _quaternion.w;
		
		object.getVelocity( _vector );
		worldreport[ offset + 8 ] = _vector.x;
		worldreport[ offset + 9 ] = _vector.y;
		worldreport[ offset + 10 ] = _vector.z;
		
		object.getAngularVelocity( _vector );
		worldreport[ offset + 11 ] = _vector.x;
		worldreport[ offset + 12 ] = _vector.y;
		worldreport[ offset + 13 ] = _vector.z
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
	
	if ( public_functions[event.data.cmd] ) {
		if ( event.data.params.id !== undefined && _objects[event.data.params.id] === undefined && event.data.cmd !== 'addObject' ) return;
		public_functions[event.data.cmd]( event.data.params );
	}
	
};