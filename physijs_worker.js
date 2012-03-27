'use strict';

var	// temp variables
	_object,
	_vector1,
	_vector2,
	_vector3,
	_quaternion1,
	
	// functions
	public_functions = {},
	reportWorld,
	addCollisions,
	
	// world variables
	fixedTimeStep, // used when calling stepSimulation
	last_simulation_time, // store in *seconds*
	world,
	
	// private cache
	_now,
	_objects = [];
	//__objects_cannon = {};


public_functions.init = function( params ) {
	importScripts( params.cannon );
	
	_vector1 = new CANNON.Vec3;
	_vector2 = new CANNON.Vec3;
	_vector3 = new CANNON.Vec3;
	_quaternion1 = new CANNON.Quaternion;
	
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
	//__objects_cannon[body.a] = body.id;
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
		
		last_simulation_time = _now;
	}
};

reportWorld = function() {
	var index, object,
		report = [],
		origin, rotation;
	
	for ( index in _objects ) {
		if ( _objects.hasOwnProperty( index ) ) {
			object = _objects[index];
			
			object.getPosition( _vector1 );
			object.getOrientation( _quaternion1 );
			object.getVelocity( _vector2 );
			object.getAngularvelocity( _vector3 );
			
			report[object.id] = {
				pos_x: _vector1.x,
				pos_y: _vector1.y,
				pos_z: _vector1.z,
				
				quat_x: _quaternion1.x,
				quat_y: _quaternion1.y,
				quat_z: _quaternion1.z,
				quat_w: _quaternion1.w,
				
				linear_x: _vector2.x,
				linear_y: _vector2.y,
				linear_z: _vector2.z,
				
				angular_x: _vector3.x,
				angular_y: _vector3.y,
				angular_z: _vector3.z,
				
				collisions: []
			};
		}
	}
	
	//addCollisions( report );
	
	self.postMessage({ cmd: 'update', params: { objects: report } });
};

addCollisions = function( objects ) {
	/*
	var i,
		dp = world.getDispatcher(),
		num = dp.getNumManifolds(),
		manifold;
	
	var _collided = false;
	for ( i = 0; i < num; i++ ) {
		manifold = dp.getManifoldByIndexInternal( i );
		
		var num_contacts = manifold.getNumContacts(), j, pt;
		if ( num_contacts == 0 ) continue;
		
		for ( j = 0; j < num_contacts; j++ ) {
			pt = manifold.getContactPoint( j );
			//if ( pt.getDistance() < 0 ) {
				objects[__objects_cannon[manifold.getBody0()]].collisions.push( _objects[__objects_cannon[manifold.getBody1()]].id );
				break;
			//}
		}
	}
	*/
};


self.onmessage = function( event ) {
	
	if ( public_functions[event.data.cmd] ) {
		if ( event.data.params.id !== undefined && _objects[event.data.params.id] === undefined && event.data.cmd !== 'addObject' ) return;
		public_functions[event.data.cmd]( event.data.params );
	}
	
};