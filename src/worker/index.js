import MESSAGE_TYPES from '../MESSAGE_TYPES';
import BODY_TYPES from '../BODY_TYPES';

// trick rollup into including Goblin
import * as _goblin from '../../lib/goblin.min.js';
var Goblin = self.Goblin || _goblin;

// report-related variables and constants
function ensureReportSize( report, report_size, chunk_size ) {
	var needed_buffer_size = ( report_size + 3 ) + chunk_size - report_size % chunk_size; // the +2 is to
		// add an array element to hold the report type, number of ticks simulation has gone through, and length of array data
	if ( report.length < needed_buffer_size ) {
		report = new Float32Array( needed_buffer_size );
	}
	return report;
}
var WORLD_REPORT_SIZE_RIGIDBODY = 30; // 1 body id + 16 matrix elements + 3 position elements + 4 rotation elements + 3 linear velocity + 3 angular_velocity
var WORLD_REPORT_CHUNK_SIZE = 100 * WORLD_REPORT_SIZE_RIGIDBODY; // increase buffer by enough to hold 100 objects each time
var world_report = new Float32Array( 0 );

// global variables for the simulation
var world;
var id_rigid_body_map = {};

function postReport( report ) {
	self.postMessage( report, [report.buffer] );
}

function reportWorld() {
	// compute necessary buffer size
	var rigid_body_ids = Object.keys( id_rigid_body_map );
	var rigid_bodies_count = rigid_body_ids.length;
	var report_size = ( WORLD_REPORT_SIZE_RIGIDBODY * rigid_bodies_count ); // elements needed to report bodies
	world_report = ensureReportSize( world_report, report_size, WORLD_REPORT_CHUNK_SIZE );

	// populate the report
	var idx = 0;
	world_report[idx++] = MESSAGE_TYPES.REPORTS.WORLD;
	world_report[idx++] = world.ticks;
	world_report[idx++] = rigid_bodies_count;

	for ( var i = 0; i < rigid_bodies_count; i++ ) {
		var rigid_body_id = rigid_body_ids[ i ];
		var rigid_body = id_rigid_body_map[ rigid_body_id ];
		world_report[idx++] = rigid_body_id;

		world_report[idx++] = rigid_body.transform.e00;
		world_report[idx++] = rigid_body.transform.e01;
		world_report[idx++] = rigid_body.transform.e02;
		world_report[idx++] = rigid_body.transform.e03;

		world_report[idx++] = rigid_body.transform.e10;
		world_report[idx++] = rigid_body.transform.e11;
		world_report[idx++] = rigid_body.transform.e12;
		world_report[idx++] = rigid_body.transform.e13;

		world_report[idx++] = rigid_body.transform.e20;
		world_report[idx++] = rigid_body.transform.e21;
		world_report[idx++] = rigid_body.transform.e22;
		world_report[idx++] = rigid_body.transform.e23;

		world_report[idx++] = rigid_body.transform.e30;
		world_report[idx++] = rigid_body.transform.e31;
		world_report[idx++] = rigid_body.transform.e32;
		world_report[idx++] = rigid_body.transform.e33;

		world_report[idx++] = rigid_body.position.x;
		world_report[idx++] = rigid_body.position.y;
		world_report[idx++] = rigid_body.position.z;

		world_report[idx++] = rigid_body.rotation.x;
		world_report[idx++] = rigid_body.rotation.y;
		world_report[idx++] = rigid_body.rotation.z;
		world_report[idx++] = rigid_body.rotation.w;

		world_report[idx++] = rigid_body.linear_velocity.x;
		world_report[idx++] = rigid_body.linear_velocity.y;
		world_report[idx++] = rigid_body.linear_velocity.z;

		world_report[idx++] = rigid_body.angular_velocity.x;
		world_report[idx++] = rigid_body.angular_velocity.y;
		world_report[idx++] = rigid_body.angular_velocity.z;
	}

	postReport( world_report );
}

// message handling
(function() {
	var handlers = {};
	function handleMessage( message, handler ) {
		handlers[message] = handler;
	}
	self.addEventListener(
		'message',
		function(e) {
			var data = e.data;
			var type;
			var parameters;

			if ( data instanceof Float32Array ) {
				type = data[0];
				parameters = data;
			} else {
				data = data || {};
				type = data.type;
				parameters = data.parameters;
			}

			if ( handlers.hasOwnProperty( type ) ) {
				handlers[type]( parameters );
			} else {
				throw new Error( 'Physijs worker received unknown message type: ' + type );
			}
		}
	);

	handleMessage(
		MESSAGE_TYPES.REPORTS.WORLD,
		function( report ) {
			world_report = report;
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
			var shape_definition = parameters.shape_definition;
			var shape;

			if ( shape_definition.body_type === BODY_TYPES.BOX ) {
				shape = new Goblin.BoxShape( shape_definition.width, shape_definition.height, shape_definition.depth );
			} else if ( shape_definition.body_type === BODY_TYPES.CONE ) {
				shape = new Goblin.ConeShape(shape_definition.radius, shape_definition.height);
			} else if ( shape_definition.body_type === BODY_TYPES.CONVEX ) {
				shape = new Goblin.ConvexShape(
					shape_definition.vertices.reduce(
						function( vertices, component, idx, source ) {
							if (idx % 3 == 0) {
								vertices.push(
									new Goblin.Vector3( source[idx], source[idx+1], source[idx+2] )
								);
							}
							return vertices;
						},
						[]
					)
				);
			} else if ( shape_definition.body_type === BODY_TYPES.CYLINDER ) {
				shape = new Goblin.CylinderShape( shape_definition.radius, shape_definition.height );
			} else if ( shape_definition.body_type === BODY_TYPES.PLANE ) {
				shape = new Goblin.PlaneShape( 2, shape_definition.width, shape_definition.height );
			} else if ( shape_definition.body_type === BODY_TYPES.SPHERE ) {
				shape = new Goblin.SphereShape( shape_definition.radius );
			}

			var body = new Goblin.RigidBody( shape, parameters.mass );

			body.restitution = parameters.restitution;
			body.friction = parameters.friction;
			body.linear_damping = parameters.linear_damping;
			body.angular_damping = parameters.angular_damping;
			body.collision_groups = parameters.collision_groups;
			body.collision_mask = parameters.collision_mask;

			world.addRigidBody( body );

			id_rigid_body_map[ parameters.body_id ] = body;
		}
	);

	handleMessage(
		MESSAGE_TYPES.SET_RIGIDBODY_MASS,
		function( parameters ) {
			id_rigid_body_map[ parameters.body_id ].mass = parameters.mass;
		}
	);

	handleMessage(
		MESSAGE_TYPES.SET_RIGIDBODY_RESTITUTION,
		function( parameters ) {
			id_rigid_body_map[ parameters.body_id ].restitution = parameters.restitution;
		}
	);

	handleMessage(
		MESSAGE_TYPES.SET_RIGIDBODY_FRICTION,
		function( parameters ) {
			id_rigid_body_map[ parameters.body_id ].friction = parameters.friction;
		}
	);

	handleMessage(
		MESSAGE_TYPES.SET_RIGIDBODY_LINEAR_DAMPING,
		function( parameters ) {
			id_rigid_body_map[ parameters.body_id ].linear_damping = parameters.damping;
		}
	);

	handleMessage(
		MESSAGE_TYPES.SET_RIGIDBODY_ANGULAR_DAMPING,
		function( parameters ) {
			id_rigid_body_map[ parameters.body_id ].angular_damping = parameters.damping;
		}
	);

	handleMessage(
		MESSAGE_TYPES.SET_RIGIDBODY_COLLISION_GROUPS,
		function( parameters ) {
			console.log('setting groups to', parameters.collision_groups);
			id_rigid_body_map[ parameters.body_id ].collision_groups = parameters.collision_groups;
		}
	);

	handleMessage(
		MESSAGE_TYPES.SET_RIGIDBODY_COLLISION_MASK,
		function( parameters ) {
			console.log('setting mask to', parameters.collision_mask);
			id_rigid_body_map[ parameters.body_id ].collision_mask = parameters.collision_mask;
		}
	);

	handleMessage(
		MESSAGE_TYPES.SET_RIGIDBODY_TRANSFORM,
		function( parameters ) {
			id_rigid_body_map[ parameters.body_id ].position.set(
				parameters.position.x,
				parameters.position.y,
				parameters.position.z
			);

			id_rigid_body_map[ parameters.body_id ].rotation.set(
				parameters.rotation.x,
				parameters.rotation.y,
				parameters.rotation.z,
				parameters.rotation.w
			);
		}
	);

	handleMessage(
		MESSAGE_TYPES.SET_RIGIDBODY_LINEAR_VELOCITY,
		function( parameters ) {
			id_rigid_body_map[ parameters.body_id ].linear_velocity.set(
				parameters.velocity.x,
				parameters.velocity.y,
				parameters.velocity.z
			);
		}
	);

	handleMessage(
		MESSAGE_TYPES.SET_RIGIDBODY_ANGULAR_VELOCITY,
		function( parameters ) {
			id_rigid_body_map[ parameters.body_id ].angular_velocity.set(
				parameters.velocity.x,
				parameters.velocity.y,
				parameters.velocity.z
			);
		}
	);

	handleMessage(
		MESSAGE_TYPES.SET_RIGIDBODY_LINEAR_FACTOR,
		function( parameters ) {
			console.log('setting linear factor', parameters);
			id_rigid_body_map[ parameters.body_id ].linear_factor.set(
				parameters.factor.x,
				parameters.factor.y,
				parameters.factor.z
			);
		}
	);

	handleMessage(
		MESSAGE_TYPES.SET_RIGIDBODY_ANGULAR_FACTOR,
		function( parameters ) {
			id_rigid_body_map[ parameters.body_id ].angular_factor.set(
				parameters.factor.x,
				parameters.factor.y,
				parameters.factor.z
			);
		}
	);

	handleMessage(
		MESSAGE_TYPES.STEP_SIMULATION,
		function( parameters ) {
			world.step( parameters.time_delta, parameters.max_step );
			reportWorld();
		}
	);
})();