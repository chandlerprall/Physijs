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

	function setRigidBodyAngularFactor( body_id, mesh ) {
		this.physijs.postMessage(
			MESSAGE_TYPES.SET_RIGIDBODY_ANGULAR_FACTOR,
			{
				body_id: body_id,
				factor: { x: mesh.angular_factor.x, y: mesh.angular_factor.y, z: mesh.angular_factor.z }
			}
		);
	}

	function setRigidBodyLinearFactor( body_id, mesh ) {
		this.physijs.postMessage(
			MESSAGE_TYPES.SET_RIGIDBODY_LINEAR_FACTOR,
			{
				body_id: body_id,
				factor: { x: mesh.linear_factor.x, y: mesh.linear_factor.y, z: mesh.linear_factor.z }
			}
		);
	}

	function setRigidBodyAngularVelocity( body_id, mesh ) {
		this.physijs.postMessage(
			MESSAGE_TYPES.SET_RIGIDBODY_ANGULAR_VELOCITY,
			{
				body_id: body_id,
				velocity: { x: mesh.angular_velocity.x, y: mesh.angular_velocity.y, z: mesh.angular_velocity.z }
			}
		);
	}

	function setRigidBodyLinearVelocity( body_id, mesh ) {
		this.physijs.postMessage(
			MESSAGE_TYPES.SET_RIGIDBODY_LINEAR_VELOCITY,
			{
				body_id: body_id,
				velocity: { x: mesh.linear_velocity.x, y: mesh.linear_velocity.y, z: mesh.linear_velocity.z }
			}
		);
	}

	function setRigidBodyTransform( body_id, mesh ) {
		this.physijs.postMessage(
			MESSAGE_TYPES.SET_RIGIDBODY_TRANSFORM,
			{
				body_id: body_id,
				position: { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z },
				rotation: { x: mesh.quaternion.x, y: mesh.quaternion.y, z: mesh.quaternion.z, w: mesh.quaternion.w }
			}
		);
	}

	function setRigidBodyCollisionMask( mesh ) {
		this.physijs.postMessage(
			MESSAGE_TYPES.SET_RIGIDBODY_COLLISION_MASK,
			{
				body_id: mesh.physijs.id,
				collision_mask: mesh.physijs.collision_mask
			}
		);
	}

	function setRigidBodyCollisionGroups( mesh ) {
		this.physijs.postMessage(
			MESSAGE_TYPES.SET_RIGIDBODY_COLLISION_GROUPS,
			{
				body_id: mesh.physijs.id,
				collision_groups: mesh.physijs.collision_groups
			}
		);
	}

	function setRigidBodyAngularDamping( mesh ) {
		this.physijs.postMessage(
			MESSAGE_TYPES.SET_RIGIDBODY_ANGULAR_DAMPING,
			{
				body_id: mesh.physijs.id,
				damping: mesh.physijs.angular_damping
			}
		);
	}

	function setRigidBodyLinearDamping( mesh ) {
		this.physijs.postMessage(
			MESSAGE_TYPES.SET_RIGIDBODY_LINEAR_DAMPING,
			{
				body_id: mesh.physijs.id,
				damping: mesh.physijs.linear_damping
			}
		);
	}

	function setRigidBodyFriction( mesh ) {
		this.physijs.postMessage(
			MESSAGE_TYPES.SET_RIGIDBODY_FRICTION,
			{
				body_id: mesh.physijs.id,
				friction: mesh.physijs.friction
			}
		);
	}

	function setRigidBodyRestitution( mesh ) {
		this.physijs.postMessage(
			MESSAGE_TYPES.SET_RIGIDBODY_RESTITUTION,
			{
				body_id: mesh.physijs.id,
				restitution: mesh.physijs.restitution
			}
		);
	}

	function setRigidBodyMass( mesh ) {
		this.physijs.postMessage(
			MESSAGE_TYPES.SET_RIGIDBODY_MASS,
			{
				body_id: mesh.physijs.id,
				mass: mesh.physijs.mass
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

			rigid_body.position.copy( rigid_body.physijs.position.set( report[idx++], report[idx++], report[idx++] ) );
			rigid_body.quaternion.copy( rigid_body.physijs.quaternion.set( report[idx++], report[idx++], report[idx++], report[idx++] ) );
			rigid_body.linear_velocity.copy( rigid_body.physijs.linear_velocity.set( report[idx++], report[idx++], report[idx++] ) );
			rigid_body.angular_velocity.copy( rigid_body.physijs.angular_velocity.set( report[idx++], report[idx++], report[idx++] ) );
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

	function getRigidBodyDefinition( mesh ) {
		var shape_definition = mesh.getShapeDefinition();

		return {
			body_id: mesh.physijs.id,
			shape_definition: shape_definition,
			mass: mesh.physijs.mass,
			restitution: mesh.physijs.restitution,
			friction: mesh.physijs.friction,
			linear_damping: mesh.physijs.linear_damping,
			angular_damping: mesh.physijs.angular_damping,
			collision_groups: mesh.physijs.collision_groups,
			collision_mask: mesh.physijs.collision_mask
		};
	}

	var nextId = 0;
	function getUniqueId() {
		return nextId++;
	}

	function Mesh( geometry, material, physics_descriptor ) {
		if ( physics_descriptor == null ) {
			throw new Error( 'Physijs: attempted to create rigid body without specifying physics details' );
		}

		THREE.Mesh.call( this, geometry, material );
		this.rotationAutoUpdate = false;
		this.matrixAutoUpdate = false;

		this.physijs = {
			id: getUniqueId(),

			mass: physics_descriptor.mass || Infinity,
			restitution: physics_descriptor.restitution || 0.1,
			friction: physics_descriptor.friction || 0.5,
			linear_damping: physics_descriptor.linear_damping || 0,
			angular_damping: physics_descriptor.angular_damping || 0,
			collision_groups: 0,
			collision_mask: 0,

			position: new THREE.Vector3(),
			quaternion: new THREE.Quaternion(),
			linear_velocity: new THREE.Vector3(),
			angular_velocity: new THREE.Vector3(),
			linear_factor: new THREE.Vector3( 1, 1, 1 ),
			angular_factor: new THREE.Vector3( 1, 1, 1 )
		};

		this.linear_velocity = new THREE.Vector3();
		this.angular_velocity = new THREE.Vector3();
		this.linear_factor = new THREE.Vector3( 1, 1, 1 );
		this.angular_factor = new THREE.Vector3( 1, 1, 1 );
	}

	Mesh.prototype = Object.create( THREE.Mesh.prototype );
	Mesh.prototype.constructor = Mesh;

	Object.defineProperty(
		Mesh.prototype,
		'mass',
		{
			get: function() {
				return this.physijs.mass;
			},
			set: function( mass ) {
				this.physijs.mass = mass;
				if ( this.parent != null ) {
					this.parent.physijs.setRigidBodyMass( this );
				}
			}
		}
	);

	Object.defineProperty(
		Mesh.prototype,
		'restitution',
		{
			get: function() {
				return this.physijs.restitution;
			},
			set: function( restitution ) {
				this.physijs.restitution = restitution;
				if ( this.parent != null ) {
					this.parent.physijs.setRigidBodyRestitution( this );
				}
			}
		}
	);

	Object.defineProperty(
		Mesh.prototype,
		'friction',
		{
			get: function() {
				return this.physijs.friction;
			},
			set: function( friction ) {
				this.physijs.friction = friction;
				if ( this.parent != null ) {
					this.parent.physijs.setRigidBodyFriction( this );
				}
			}
		}
	);

	Object.defineProperty(
		Mesh.prototype,
		'linear_damping',
		{
			get: function() {
				return this.physijs.linear_damping;
			},
			set: function( linear_damping ) {
				this.physijs.linear_damping = linear_damping;
				if ( this.parent != null ) {
					this.parent.physijs.setRigidBodyLinearDamping( this );
				}
			}
		}
	);

	Object.defineProperty(
		Mesh.prototype,
		'angular_damping',
		{
			get: function() {
				return this.physijs.angular_damping;
			},
			set: function( angular_damping ) {
				this.physijs.angular_damping = angular_damping;
				if ( this.parent != null ) {
					this.parent.physijs.setRigidBodyAngularDamping( this );
				}
			}
		}
	);

	Object.defineProperty(
		Mesh.prototype,
		'collision_groups',
		{
			get: function() {
				return this.physijs.collision_groups;
			},
			set: function( collision_groups ) {
				this.physijs.collision_groups = collision_groups;
				if ( this.parent != null ) {
					this.parent.physijs.setRigidBodyCollisionGroups( this );
				}
			}
		}
	);
	Object.defineProperty(
		Mesh.prototype,
		'collision_mask',
		{
			get: function() {
				return this.physijs.collision_mask;
			},
			set: function( collision_mask ) {
				this.physijs.collision_mask = collision_mask;
				if ( this.parent != null ) {
					this.parent.physijs.setRigidBodyCollisionMask( this );
				}
			}
		}
	);

	Scene.prototype.add = function( object ) {
		THREE.Scene.prototype.add.call( this, object );

		if ( object instanceof Mesh ) {
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
			if ( !rigid_body.position.equals( rigid_body.physijs.position ) || !rigid_body.quaternion.equals( rigid_body.physijs.quaternion ) ) {
				this.physijs.setRigidBodyTransform( rigid_body_id, rigid_body );
			}

			// check linear velocity
			if ( !rigid_body.linear_velocity.equals( rigid_body.physijs.linear_velocity ) ) {
				this.physijs.setRigidBodyLinearVelocity( rigid_body_id, rigid_body );
			}

			// check angular velocity
			if ( !rigid_body.angular_velocity.equals( rigid_body.physijs.angular_velocity ) ) {
				this.physijs.setRigidBodyAngularVelocity( rigid_body_id, rigid_body );
			}

			// check linear factor
			if ( !rigid_body.linear_factor.equals( rigid_body.physijs.linear_factor ) ) {
				this.physijs.setRigidBodyLinearFactor( rigid_body_id, rigid_body );
				rigid_body.physijs.linear_factor.copy( rigid_body.linear_factor );
			}

			// check angular factor
			if ( !rigid_body.angular_factor.equals( rigid_body.physijs.angular_factor ) ) {
				this.physijs.setRigidBodyAngularFactor( rigid_body_id, rigid_body );
				rigid_body.physijs.angular_factor.copy( rigid_body.angular_factor );
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

	function SphereMesh( geometry, material, mass ) {
		Mesh.call( this, geometry, material, mass );
	}

	SphereMesh.prototype = Object.create( Mesh.prototype );
	SphereMesh.prototype.constructor = SphereMesh;

	var BODY_TYPES = {
		/**
		 * radius Float radius of the sphere
		 */
		SPHERE: 'SPHERE',

		/**
		 * width Float box extent on x axis
		 * height Float box extent on y axis
		 * depth Float box extent on z axis
		 */
		BOX: 'BOX',

		/**
		 * width Float box extent on x axis
		 * height Float box extent on y axis
		 */
		PLANE: 'PLANE'
	}

	SphereMesh.prototype.getShapeDefinition = function() {
		this.geometry.computeBoundingSphere(); // make sure bounding radius has been calculated

		return {
			body_type: BODY_TYPES.SPHERE,
			radius: this.geometry.boundingSphere.radius
		};
	};

	function PlaneMesh( geometry, material, mass ) {
		Mesh.call( this, geometry, material, mass );
	}

	PlaneMesh.prototype = Object.create( Mesh.prototype );
	PlaneMesh.prototype.constructor = PlaneMesh;

	PlaneMesh.prototype.getShapeDefinition = function() {
		this.geometry.computeBoundingBox(); // make sure bounding radius has been calculated

		return {
			body_type: BODY_TYPES.PLANE,
			width: this.geometry.boundingBox.max.x,
			height: this.geometry.boundingBox.max.y
		};
	};

	function BoxMesh( geometry, material, mass ) {
		Mesh.call( this, geometry, material, mass );
	}

	BoxMesh.prototype = Object.create( Mesh.prototype );
	BoxMesh.prototype.constructor = BoxMesh;

	BoxMesh.prototype.getShapeDefinition = function() {
		this.geometry.computeBoundingBox(); // make sure bounding radius has been calculated

		return {
			body_type: BODY_TYPES.BOX,
			width: this.geometry.boundingBox.max.x,
			height: this.geometry.boundingBox.max.y,
			depth: this.geometry.boundingBox.max.z
		};
	};

	var index = {
		Mesh: Mesh,
		BoxMesh: BoxMesh,
		PlaneMesh: PlaneMesh,
		SphereMesh: SphereMesh,

		Scene: Scene
	};

	return index;

}));