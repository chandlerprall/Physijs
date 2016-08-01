export default {
	REPORTS: {
		/**
		 * world report containing matrix data for rigid bodies
		 * element [1] is how many simulation ticks have been processed (world.ticks)
		 * element [2] is number of rigid bodies in the array
		 * 2...n elements are the bodies' matrix data
		 */
		WORLD: 0,

		/**
		 * contains details for new contacts
		 * element [1] is the number of collisions, each collision is represented by:
		 * [object_a_id, object_b_id, world_contact_point{xyz}, contact_normal{xyz}, linear_velocity_delta{xyz}, angular_velocity_delta{xyz}, penetration_depth]
		 */
		COLLISIONS: 1
	},

	/**
	 * initializes the physics world
	 * [broadphase] String either 'sap' or 'naive' [default 'sap']
	 * [gravity] Object with float properties `x`, `y`, `z` [default {x:0, y:-9.8, z:0} ]
	 */
	INITIALIZE: 'INITIALIZE',

	ADD_GHOSTBODY: 'ADD_GHOSTBODY',
	/**
	 * adds a ghost body to the world
	 * body_id Integer unique id for the body
	 * shape_description Object definition corresponding to the type of rigid body (see BODY_TYPES)
	 * collision_groups Integer body's collision groups
	 * collision_mask Integer body's collision mask
	 */

	/**
	 * adds a rigid body to the world
	 * body_id Integer unique id for the body
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
	 * applys a force at a local location
	 * body_id Integer unique integer id for the body
	 * force Object force to apply to the body {x:x, y:y, z:z}
	 * local_location Object where, relative to the body, the force is applied {x:x, y:y, z:z}
	 */
	APPLY_FORCE: 'APPLY_FORCE',

	/**
	 * removes a ghost body from the world
	 * body_id Integer unique id of the body
	 */
	REMOVE_GHOSTBODY: 'REMOVE_GHOSTBODY',

	/**
	 * removes a rigid body from the world
	 * body_id Integer unique id of the body
	 */
	REMOVE_RIGIDBODY: 'REMOVE_RIGIDBODY',

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
	STEP_SIMULATION: 'STEP_SIMULATION',

	/**
	 * performs ray traces
	 * raytrace_id unique identifier for this request
	 * rays Array[ { start: { x:x, y:y, z:z }, end: { x:x, y:y, z:z } } ]
	 */
	RAYTRACE: 'RAYTRACE',

	/**
	 * results of a raytrace request
	 * raytrace_id unique identifier of the request
	 * results Array[ Array[ { body_id:body_id, point: { x:x, y:y, z:z }, normal: { x:x, y:y, z:z } } ] ]
	 */
	RAYTRACE_RESULTS: 'RAYTRACE_RESULTS',

	/**
	 * adds a constraint on one or two bodies to the world
	 * entirety of the message body corresponds to the type of constraint (see CONSTRAINT_TYPES)
	 */
	ADD_CONSTRAINT: 'ADD_CONSTRAINT'
};