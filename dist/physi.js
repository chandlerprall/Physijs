(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	global.physijs = factory();
}(this, function () { 'use strict';

	var MESSAGE_TYPES = {
		REPORTS: {
			/**
			 * world report containing matrix data for rigid bodies
			 * element [1] is number of rigid bodies in the array
			 * 2...n elements are the bodies' matrix data
			 */
			WORLD: 0
		},

		/**
		 * initializes the physics world
		 * [broadphase] String either 'sap' or 'naive' [default 'sap']
		 * [gravity] Object with float properties `x`, `y`, `z` [default {x:0, y:-9.8, z:0} ]
		 */
		INITIALIZE: 'INITIALIZE',

		/**
		 * adds a rigid body to the world
		 * body_id Integer unique integer id for the body
		 * shape_description Object definition corresponding to the type of rigid body (see BODY_TYPES)
		 * mass Float amount of mass the body has, 0 or Infinity creates a static object
		 * restitution Float body's restitution
		 * friction Float body's friction
		 * linear_damping Float body's linear damping
		 * angular_damping Float body's angular damping
		 * collision_groups Integer body's collision groups
		 * collision_mask Integer body's collision mask
		 */
		ADD_RIGIDBODY: 'ADD_RIGIDBODY',

		/**
		 * sets the specified rigid body's mass
		 * body_id Integer unique integer id for the body
		 * mass Float new mass value
		 */
		SET_RIGIDBODY_MASS: 'SET_RIGIDBODY_MASS',

		/**
		 * sets the specified rigid body's restitution
		 * body_id Integer unique integer id for the body
		 * mass Float new restitution value
		 */
		SET_RIGIDBODY_RESTITUTION: 'SET_RIGIDBODY_RESTITUTION',

		/**
		 * sets the specified rigid body's friction
		 * body_id Integer unique integer id for the body
		 * mass Float new friction value
		 */
		SET_RIGIDBODY_FRICTION: 'SET_RIGIDBODY_FRICTION',

		/**
		 * sets the specified rigid body's linear damping
		 * body_id Integer unique integer id for the body
		 * damping Float new linear damping value
		 */
		SET_RIGIDBODY_LINEAR_DAMPING: 'SET_RIGIDBODY_LINEAR_DAMPING',

		/**
		 * sets the specified rigid body's angular damping
		 * body_id Integer unique integer id for the body
		 * damping Float new angular damping value
		 */
		SET_RIGIDBODY_ANGULAR_DAMPING: 'SET_RIGIDBODY_ANGULAR_DAMPING',

		/**
		 * sets the specified rigid body's collision groups
		 * body_id Integer unique integer id for the body
		 * groups Integer new collision group value
		 */
		SET_RIGIDBODY_COLLISION_GROUPS: 'SET_RIGIDBODY_COLLISION_GROUPS',

		/**
		 * sets the specified rigid body's collision mask
		 * body_id Integer unique integer id for the body
		 * mask Integer new collision mask value
		 */
		SET_RIGIDBODY_COLLISION_MASK: 'SET_RIGIDBODY_COLLISION_MASK',

		/**
		 * sets the specified rigid body's position & rotation
		 * body_id Integer unique integer id for the body
		 * position Object new coordinates for the body's position, {x:x, y:y, z:z}
		 * rotation Object new quaternion values {x:x, y:y, z:z, w:w}
		 */
		SET_RIGIDBODY_TRANSFORM: 'SET_RIGIDBODY_TRANSFORM',

		/**
		 * sets the specified rigid body's linear velocity
		 * body_id Integer unique integer id for the body
		 * velocity Object new values for the body's linear velocity, {x:x, y:y, z:z}
		 */
		SET_RIGIDBODY_LINEAR_VELOCITY: 'SET_RIGIDBODY_LINEAR_VELOCITY',

		/**
		 * sets the specified rigid body's angular velocity
		 * body_id Integer unique integer id for the body
		 * velocity Object new values for the body's angular velocity, {x:x, y:y, z:z}
		 */
		SET_RIGIDBODY_ANGULAR_VELOCITY: 'SET_RIGIDBODY_ANGULAR_VELOCITY',

		/**
		 * sets the specified rigid body's linear factor
		 * body_id Integer unique integer id for the body
		 * factor Object new values for the body's linear factor, {x:x, y:y, z:z}
		 */
		SET_RIGIDBODY_LINEAR_FACTOR: 'SET_RIGIDBODY_LINEAR_FACTOR',

		/**
		 * sets the specified rigid body's angular factor
		 * body_id Integer unique integer id for the body
		 * factor Object new values for the body's angular factor, {x:x, y:y, z:z}
		 */
		SET_RIGIDBODY_ANGULAR_FACTOR: 'SET_RIGIDBODY_ANGULAR_FACTOR',

		/**
		 * steps the physics simulation
		 * time_delta Float total amount of time, in seconds, to step the simulation by
		 * [max_step] Float maximum step of size, in seconds [default is value of `time_delta`]
		 */
		STEP_SIMULATION: 'STEP_SIMULATION'
	};

	function setRigidBodyAngularFactor( body ) {
		this.physijs.postMessage(
			MESSAGE_TYPES.SET_RIGIDBODY_ANGULAR_FACTOR,
			{
				body_id: body.physics._.id,
				factor: { x: body.physics.angular_factor.x, y: body.physics.angular_factor.y, z: body.physics.angular_factor.z }
			}
		);
	}

	function setRigidBodyLinearFactor( body ) {
		this.physijs.postMessage(
			MESSAGE_TYPES.SET_RIGIDBODY_LINEAR_FACTOR,
			{
				body_id: body.physics._.id,
				factor: { x: body.physics.linear_factor.x, y: body.physics.linear_factor.y, z: body.physics.linear_factor.z }
			}
		);
	}

	function setRigidBodyAngularVelocity( body ) {
		this.physijs.postMessage(
			MESSAGE_TYPES.SET_RIGIDBODY_ANGULAR_VELOCITY,
			{
				body_id: body.physics._.id,
				velocity: { x: body.physics.angular_velocity.x, y: body.physics.angular_velocity.y, z: body.physics.angular_velocity.z }
			}
		);
	}

	function setRigidBodyLinearVelocity( body ) {
		this.physijs.postMessage(
			MESSAGE_TYPES.SET_RIGIDBODY_LINEAR_VELOCITY,
			{
				body_id: body.physics._.id,
				velocity: { x: body.physics.linear_velocity.x, y: body.physics.linear_velocity.y, z: body.physics.linear_velocity.z }
			}
		);
	}

	function setRigidBodyTransform( body ) {
		this.physijs.postMessage(
			MESSAGE_TYPES.SET_RIGIDBODY_TRANSFORM,
			{
				body_id: body.physics._.id,
				position: { x: body.position.x, y: body.position.y, z: body.position.z },
				rotation: { x: body.quaternion.x, y: body.quaternion.y, z: body.quaternion.z, w: body.quaternion.w }
			}
		);
	}

	function setRigidBodyCollisionMask( physics_object ) {
		this.physijs.postMessage(
			MESSAGE_TYPES.SET_RIGIDBODY_COLLISION_MASK,
			{
				body_id: physics_object._.id,
				collision_mask: physics_object._.collision_mask
			}
		);
	}

	function setRigidBodyCollisionGroups( physics_object ) {
		this.physijs.postMessage(
			MESSAGE_TYPES.SET_RIGIDBODY_COLLISION_GROUPS,
			{
				body_id: physics_object._.id,
				collision_groups: physics_object._.collision_groups
			}
		);
	}

	function setRigidBodyAngularDamping( physics_object ) {
		this.physijs.postMessage(
			MESSAGE_TYPES.SET_RIGIDBODY_ANGULAR_DAMPING,
			{
				body_id: physics_object._.id,
				damping: physics_object._.angular_damping
			}
		);
	}

	function setRigidBodyLinearDamping( physics_object ) {
		this.physijs.postMessage(
			MESSAGE_TYPES.SET_RIGIDBODY_LINEAR_DAMPING,
			{
				body_id: physics_object._.id,
				damping: physics_object._.linear_damping
			}
		);
	}

	function setRigidBodyFriction( physics_object ) {
		this.physijs.postMessage(
			MESSAGE_TYPES.SET_RIGIDBODY_FRICTION,
			{
				body_id: physics_object._.id,
				friction: physics_object._.friction
			}
		);
	}

	function setRigidBodyRestitution( physics_object ) {
		this.physijs.postMessage(
			MESSAGE_TYPES.SET_RIGIDBODY_RESTITUTION,
			{
				body_id: physics_object._.id,
				restitution: physics_object._.restitution
			}
		);
	}

	function setRigidBodyMass( physics_object ) {
		this.physijs.postMessage(
			MESSAGE_TYPES.SET_RIGIDBODY_MASS,
			{
				body_id: physics_object._.id,
				mass: physics_object._.mass
			}
		);
	}

	function postReport( report ) {
		this.physijs.worker.postMessage( report, [report.buffer] );
	}

	function postMessage( type, parameters ) {
		this.physijs.worker.postMessage({
			type: type,
			parameters: parameters
		});
	}

	function processWorldReport( report ) {
		var simulation_ticks = report[1];
		var rigid_body_count = report[2];

		for ( var i = 0; i < rigid_body_count; i++ ) {
			var idx = 3 + i * 30; // [WORLD, # TICKS, # BODIES, n*30 elements ...]
			var rigid_body_id = report[idx++];
			var rigid_body = this.physijs.id_rigid_body_map[ rigid_body_id ];

			rigid_body.matrix.set(
				report[idx++], report[idx++], report[idx++], report[idx++],
				report[idx++], report[idx++], report[idx++], report[idx++],
				report[idx++], report[idx++], report[idx++], report[idx++],
				report[idx++], report[idx++], report[idx++], report[idx++]
			);

			rigid_body.position.copy( rigid_body.physics._.position.set( report[idx++], report[idx++], report[idx++] ) );
			rigid_body.quaternion.copy( rigid_body.physics._.quaternion.set( report[idx++], report[idx++], report[idx++], report[idx++] ) );
			rigid_body.physics.linear_velocity.copy( rigid_body.physics._.linear_velocity.set( report[idx++], report[idx++], report[idx++] ) );
			rigid_body.physics.angular_velocity.copy( rigid_body.physics._.angular_velocity.set( report[idx++], report[idx++], report[idx++] ) );
		}

		// send the buffer back for re-use
		this.physijs.postReport( report );

		// world report is over, we're no longer stepping
		this.physijs.is_stepping = false;
		if ( this.physijs.onStep instanceof Function ) {
			var onStep = this.physijs.onStep;
			this.physijs.onStep = null;
			onStep.call( this, simulation_ticks );
		}
	}

	function initializeWorker( worker_script_location, world_config ) {
		this.physijs.worker = new Worker( worker_script_location );
		this.physijs.worker.addEventListener(
			'message',
			function(e) {
				var data = e.data;

				if ( data instanceof Float32Array ) {
					// it's a report
					var report_type = data[0];
					if ( report_type === MESSAGE_TYPES.REPORTS.WORLD ) {
						this.physijs.processWorldReport( data );
					}
				}
			}.bind( this )
		);
		this.physijs.postMessage( MESSAGE_TYPES.INITIALIZE, world_config || {} );
	}

	function Scene( worker_script_location, world_config ) {
		THREE.Scene.call( this );

		this.physijs = {
			is_stepping: false,
			id_rigid_body_map: {},
			onStep: null,

			initializeWorker: initializeWorker.bind( this ),
			processWorldReport: processWorldReport.bind( this ),
			postMessage: postMessage.bind( this ),
			postReport: postReport.bind( this ),
			setRigidBodyMass: setRigidBodyMass.bind( this ),
			setRigidBodyRestitution: setRigidBodyRestitution.bind( this ),
			setRigidBodyFriction: setRigidBodyFriction.bind( this ),
			setRigidBodyLinearDamping: setRigidBodyLinearDamping.bind( this ),
			setRigidBodyAngularDamping: setRigidBodyAngularDamping.bind( this ),
			setRigidBodyCollisionGroups: setRigidBodyCollisionGroups.bind( this ),
			setRigidBodyCollisionMask: setRigidBodyCollisionMask.bind( this ),
			setRigidBodyTransform: setRigidBodyTransform.bind( this ),
			setRigidBodyLinearVelocity: setRigidBodyLinearVelocity.bind( this ),
			setRigidBodyAngularVelocity: setRigidBodyAngularVelocity.bind( this ),
			setRigidBodyLinearFactor: setRigidBodyLinearFactor.bind( this ),
			setRigidBodyAngularFactor: setRigidBodyAngularFactor.bind( this )
		};

		this.physijs.initializeWorker( worker_script_location, world_config );
	}

	Scene.prototype = Object.create( THREE.Scene.prototype );
	Scene.prototype.constructor = Scene;

	function getRigidBodyDefinition( object ) {
		var shape_definition = object.physics.getShapeDefinition( object.physics.geometry );

		return {
			body_id: object.physics._.id,
			shape_definition: shape_definition,
			mass: object.physics._.mass,
			restitution: object.physics._.restitution,
			friction: object.physics._.friction,
			linear_damping: object.physics._.linear_damping,
			angular_damping: object.physics._.angular_damping,
			collision_groups: object.physics._.collision_groups,
			collision_mask: object.physics._.collision_mask
		};
	}

	var nextId = 0;
	function getUniqueId() {
		return nextId++;
	}

	function _PhysicsObject( three_object, geometry, physics_descriptor, getShapeDefinition ) {
		physics_descriptor = physics_descriptor || {};

		this.three_object = three_object;
		this.geometry = geometry;
		this.getShapeDefinition = getShapeDefinition;

		this.linear_velocity = new THREE.Vector3();
		this.angular_velocity = new THREE.Vector3();
		this.linear_factor = new THREE.Vector3( 1, 1, 1 );
		this.angular_factor = new THREE.Vector3( 1, 1, 1 );

		this._ = {
			id: getUniqueId(),

			mass: physics_descriptor.mass || Infinity,
			restitution: physics_descriptor.restitution || 0.1,
			friction: physics_descriptor.friction || 0.5,
			linear_damping: physics_descriptor.linear_damping || 0,
			angular_damping: physics_descriptor.angular_damping || 0,
			collision_groups: physics_descriptor.collision_groups || 0,
			collision_mask: physics_descriptor.collision_mask || 0,

			position: new THREE.Vector3(),
			quaternion: new THREE.Quaternion(),
			linear_velocity: new THREE.Vector3(),
			angular_velocity: new THREE.Vector3(),
			linear_factor: new THREE.Vector3(1, 1, 1),
			angular_factor: new THREE.Vector3(1, 1, 1)
		};
	}

	Object.defineProperty(
		_PhysicsObject.prototype,
		'mass',
		{
			get: function() {
				return this._.mass;
			},
			set: function( mass ) {
				this._.mass = mass;
				if ( this.three_object.parent != null ) {
					this.three_object.parent.physijs.setRigidBodyMass( this );
				}
			}
		}
	);

	Object.defineProperty(
		_PhysicsObject.prototype,
		'restitution',
		{
			get: function() {
				return this._.restitution;
			},
			set: function( restitution ) {
				this._.restitution = restitution;
				if ( this.three_object.parent != null ) {
					this.three_object.parent.physijs.setRigidBodyRestitution( this );
				}
			}
		}
	);

	Object.defineProperty(
		_PhysicsObject.prototype,
		'friction',
		{
			get: function() {
				return this._.friction;
			},
			set: function( friction ) {
				this._.friction = friction;
				if ( this.three_object.parent != null ) {
					this.three_object.parent.physijs.setRigidBodyFriction( this );
				}
			}
		}
	);

	Object.defineProperty(
		_PhysicsObject.prototype,
		'linear_damping',
		{
			get: function() {
				return this._.linear_damping;
			},
			set: function( linear_damping ) {
				this._.linear_damping = linear_damping;
				if ( this.three_object.parent != null ) {
					this.three_object.parent.physijs.setRigidBodyLinearDamping( this );
				}
			}
		}
	);

	Object.defineProperty(
		_PhysicsObject.prototype,
		'angular_damping',
		{
			get: function() {
				return this._.angular_damping;
			},
			set: function( angular_damping ) {
				this._.angular_damping = angular_damping;
				if ( this.three_object.parent != null ) {
					this.three_object.parent.physijs.setRigidBodyAngularDamping( this );
				}
			}
		}
	);

	Object.defineProperty(
		_PhysicsObject.prototype,
		'collision_groups',
		{
			get: function() {
				return this._.collision_groups;
			},
			set: function( collision_groups ) {
				this._.collision_groups = collision_groups;
				if ( this.three_object.parent != null ) {
					this.three_object.parent.physijs.setRigidBodyCollisionGroups( this );
				}
			}
		}
	);

	Object.defineProperty(
		_PhysicsObject.prototype,
		'collision_mask',
		{
			get: function() {
				return this._.collision_mask;
			},
			set: function( collision_mask ) {
				this._.collision_mask = collision_mask;
				if ( this.three_object.parent != null ) {
					this.three_object.parent.physijs.setRigidBodyCollisionMask( this );
				}
			}
		}
	);

	Scene.prototype.add = function( object ) {
		THREE.Scene.prototype.add.call( this, object );

		if ( object.physics instanceof _PhysicsObject ) {
			var rigid_body_definition = getRigidBodyDefinition( object );
			this.physijs.id_rigid_body_map[ rigid_body_definition.body_id ] = object;
			this.physijs.postMessage( MESSAGE_TYPES.ADD_RIGIDBODY, rigid_body_definition );
			object.updateMatrix();
		}
	};

	Scene.prototype.step = function( time_delta, max_step, onStep ) {
		if ( this.physijs.is_stepping === true ) {
			throw new Error( 'Physijs: scene is already stepping, cannot call step() until it\'s finished' );
		}

		this.physijs.is_stepping = true;
		this.physijs.onStep = onStep;

		// check if any rigid bodies have been toyed with
		var rigid_body_ids = Object.keys( this.physijs.id_rigid_body_map );
		for ( var i = 0; i < rigid_body_ids.length; i++ ) {
			var rigid_body_id = rigid_body_ids[ i ];
			var rigid_body = this.physijs.id_rigid_body_map[ rigid_body_id ];

			// check position/rotation
			if ( !rigid_body.position.equals( rigid_body.physics._.position ) || !rigid_body.quaternion.equals( rigid_body.physics._.quaternion ) ) {
				this.physijs.setRigidBodyTransform( rigid_body );
			}

			// check linear velocity
			if ( !rigid_body.physics.linear_velocity.equals( rigid_body.physics._.linear_velocity ) ) {
				this.physijs.setRigidBodyLinearVelocity( rigid_body );
			}

			// check angular velocity
			if ( !rigid_body.physics.angular_velocity.equals( rigid_body.physics._.angular_velocity ) ) {
				this.physijs.setRigidBodyAngularVelocity( rigid_body );
			}

			// check linear factor
			if ( !rigid_body.physics.linear_factor.equals( rigid_body.physics._.linear_factor ) ) {
				this.physijs.setRigidBodyLinearFactor( rigid_body );
				rigid_body.physics._.linear_factor.copy( rigid_body.physics.linear_factor );
			}

			// check angular factor
			if ( !rigid_body.physics.angular_factor.equals( rigid_body.physics._.angular_factor ) ) {
				this.physijs.setRigidBodyAngularFactor( rigid_body );
				rigid_body.physics._.angular_factor.copy( rigid_body.physics.angular_factor );
			}
		}

		this.physijs.postMessage(
			MESSAGE_TYPES.STEP_SIMULATION,
			{
				time_delta: time_delta,
				max_step: max_step
			}
		);
	};

	var BODY_TYPES = {
		/**
		 * width Float box extent on x axis
		 * height Float box extent on y axis
		 * depth Float box extent on z axis
		 */
		BOX: 'BOX',

		/**
		 * shapes Array list of shape definitions composing the compound shape
		 */
		COMPOUND: 'COMPOUND',

		/**
		 * radius Float cylinder radius
		 * height Float cylinder extent on y axis
		 */
		CONE: 'CONE',

		/**
		 * vertices Array list of vertex components for all vertices, where list is [x1, y1, z1, x2, y2, z2 ... xN, yN, zN]
		 */
		CONVEX: 'CONVEX',

		/**
		 * radius Float cylinder radius
		 * height Float cylinder extent on y axis
		 */
		CYLINDER: 'CYLINDER',

		/**
		 * width Float plane extent on x axis
		 * height Float plane extent on y axis
		 */
		PLANE: 'PLANE',

		/**
		 * radius Float radius of the sphere
		 */
		SPHERE: 'SPHERE',

		/**
		 * vertices Array list of vertex components for all vertices, where list is [x1, y1, z1, x2, y2, z2 ... xN, yN, zN]
		 * faces Array list of vertex indexes composing the faces
		 */
		TRIANGLE: 'TRIANGLE'
	}

	function _getShapeDefinition( geometry ) {
		var vertices = geometry.vertices.reduce(
			function( vertices, vertex ) {
				vertices.push( vertex.x, vertex.y, vertex.z );
				return vertices;
			},
			[]
		);

		return {
			body_type: BODY_TYPES.CONVEX,
			vertices: vertices,
			faces: geometry.faces
		};
	}


	/*
	IF
	geometry is instanceof THREE.Geometry, the three arguments are geometry, material, physics_descriptor
	ELSE
		the first argument is assumed to be an object Three.js can understand AND
		IF the second argument is an instanceof THREE.Geometry that geometry is used to determine the physics shape
		ELSE the object passed as the first argument is assumed to have a `geometry` property

	The next argument in all cases is optional and allows for the object's physical properties to be changed
	The last argument in all cases is the getShapeDefinition function
	 */
	function PhysicsObject( first, second, third, fourth ) {
		var three_object;
		var geometry;
		var physics_descriptor;
		var getShapeDefinition;

		if ( first instanceof THREE.Geometry ) {
			geometry = first;
			three_object = new THREE.Mesh( geometry, second );
			physics_descriptor = third;
			getShapeDefinition = fourth;
		} else {
			three_object = first;
			if ( second instanceof THREE.Geometry ) {
				geometry = second;
				physics_descriptor = third;
				getShapeDefinition = fourth;
			} else {
				geometry = three_object.geometry;
				physics_descriptor = second;
				getShapeDefinition = third;
			}
		}

		three_object.rotationAutoUpdate = false;
		three_object.matrixAutoUpdate = false;

		three_object.physics = new _PhysicsObject( three_object, geometry, physics_descriptor, getShapeDefinition );

		return three_object;
	}

	function TriangleMesh( first, second, third ) {
		return PhysicsObject.call( this, first, second, third, _getShapeDefinition );
	}

	function __getShapeDefinition( geometry ) {
		geometry.computeBoundingSphere(); // make sure bounding radius has been calculated

		return {
			body_type: BODY_TYPES.SPHERE,
			radius: geometry.boundingSphere.radius
		};
	}

	function Sphere( first, second, third ) {
		return PhysicsObject.call( this, first, second, third, __getShapeDefinition );
	}

	function ___getShapeDefinition( geometry ) {
		geometry.computeBoundingBox(); // make sure bounding radius has been calculated

		return {
			body_type: BODY_TYPES.PLANE,
			width: geometry.boundingBox.max.x,
			height: geometry.boundingBox.max.y
		};
	}

	function Plane( first, second, third ) {
		return PhysicsObject.call( this, first, second, third, ___getShapeDefinition );
	}

	function ____getShapeDefinition( geometry ) {
		geometry.computeBoundingBox(); // make sure bounding radius has been calculated

		return {
			body_type: BODY_TYPES.CYLINDER,
			radius: geometry.boundingBox.max.x,
			height: geometry.boundingBox.max.y
		};
	}

	function Cylinder( first, second, third ) {
		return PhysicsObject.call( this, first, second, third, ____getShapeDefinition );
	}

	function _____getShapeDefinition( geometry ) {
		var vertices = geometry.vertices.reduce(
			function( vertices, vertex ) {
				vertices.push( vertex.x, vertex.y, vertex.z );
				return vertices;
			},
			[]
		);

		return {
			body_type: BODY_TYPES.CONVEX,
			vertices: vertices
		};
	}

	function Convex( first, second, third ) {
		return PhysicsObject.call( this, first, second, third, _____getShapeDefinition );
	}

	function ______getShapeDefinition( geometry ) {
		geometry.computeBoundingBox(); // make sure bounding radius has been calculated

		return {
			body_type: BODY_TYPES.CONE,
			radius: geometry.boundingBox.max.x,
			height: geometry.boundingBox.max.y
		};
	}

	function Cone( first, second, third ) {
		return PhysicsObject.call( this, first, second, third, ______getShapeDefinition );
	}

	function getShapeDefinition( geometry ) {
		geometry.computeBoundingBox(); // make sure bounding radius has been calculated

		return {
			body_type: BODY_TYPES.BOX,
			width: geometry.boundingBox.max.x,
			height: geometry.boundingBox.max.y,
			depth: geometry.boundingBox.max.z
		};
	}

	function Box( first, second, third ) {
		return PhysicsObject.call( this, first, second, third, getShapeDefinition );
	}

	var index = {
		PhysicsObject: PhysicsObject,
		Box: Box,
		Cone: Cone,
		Convex: Convex,
		Cylinder: Cylinder,
		Plane: Plane,
		Sphere: Sphere,
		TriangleMesh: TriangleMesh,

		//CompoundObject: CompoundObject,
		Scene: Scene
	};

	return index;

}));