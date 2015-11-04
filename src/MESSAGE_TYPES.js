export default {
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
	 * body_type String a constant found in `BODY_TYPES`
	 * body_description Object definition corresponding to the type of rigid body (see BODY_TYPES)
	 * mass Float amount of mass the body has, 0 or Infinity creates a static object
	 */
	ADD_RIGIDBODY: 'ADD_RIGIDBODY',

	/**
	 * sets the specified rigid body's mass
	 * body_id Integer unique integer id for the body
	 * mass Float new mass value
	 */
	SET_RIGIDBODY_MASS: 'SET_RIGIDBODY_MASS',

	/**
	 * sets the specified rigid body's position
	 * body_id Integer unique integer id for the body
	 * position Object new coordinates for the body's position, {x:x, y:y, z:z}
	 */
	SET_RIGIDBODY_POSITION: 'SET_RIGIDBODY_POSITION',

	/**
	 * steps the physics simulation
	 * time_delta Float total amount of time, in seconds, to step the simulation by
	 * [max_step] Float maximum step of size, in seconds [default is value of `time_delta`]
	 */
	STEP_SIMULATION: 'STEP_SIMULATION'
};