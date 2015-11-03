import MESSAGE_TYPES from '../MESSAGE_TYPES';
import BODY_TYPES from '../BODY_TYPES';

// trick rollup into including Goblin
import * as _goblin from '../../lib/goblin.min.js';
var Goblin = self.Goblin || _goblin;

// global variables for the simulation
var world;
var id_body_map = {};


// message handling
(function() {
	var handlers = {};
	function handleMessage( message, handler ) {
		handlers[message] = handler;
	}
	self.addEventListener(
		'message',
		function(e) {
			var data = e.data || {};
			var type = data.type;
			var parameters = data.parameters;
			if ( handlers.hasOwnProperty( type ) ) {
				handlers[type]( parameters );
			}
		}
	);

	handleMessage(
		MESSAGE_TYPES.INITIALIZE,
		function( parameters ) {
			var broadphase = parameters.broadphase === 'naive' ? new Goblin.BasicBroadphase() : new Goblin.SAPBroadphase();

			world = new Goblin.World(
				broadphase,
				new Goblin.NarrowPhase(),
				new Goblin.IterativeSolver()
			);

			if ( parameters.hasOwnProperty('gravity') ) {
				world.gravity.set( parameters.gravity.x, parameters.y, parameters.z );
			}
		}
	);

	handleMessage(
		MESSAGE_TYPES.ADD_RIGIDBODY,
		function( parameters ) {
			var body_definition = parameters.body_definition;
			var shape;

			if ( parameters.body_type === BODY_TYPES.SPHERE ) {
				shape = new Goblin.SphereShape( body_definition.radius );
			}

			var body = new Goblin.RigidBody( shape, parameters.mass );
			world.addRigidBody( body );

			id_body_map[ parameters.body_id ] = body;
		}
	);

	handleMessage(
		MESSAGE_TYPES.SET_RIGIDBODY_MASS,
		function( parameters ) {
			id_body_map[ parameters.body_id ].mass = parameters.mass;
		}
	)
})();