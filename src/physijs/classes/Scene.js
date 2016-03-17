import MESSAGE_TYPES from '../../MESSAGE_TYPES';
import BODY_TYPES from '../../BODY_TYPES';
import PhysicsObject, {_PhysicsObject} from './PhysicsObject';
import CompoundObject from './CompoundObject';
import {getUniqueId} from './util/UniqueId';
import Constraint from './constraints/Constraint';

var _tmp_vector3_1 = new THREE.Vector3();
var _tmp_vector3_2 = new THREE.Vector3();
var _tmp_vector3_3 = new THREE.Vector3();
var _tmp_vector3_4 = new THREE.Vector3();

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

export default function Scene( worker_script_location, world_config ) {
	THREE.Scene.call( this );

	this.physijs = {
		handlers: {},
		handleMessage: handleMessage.bind( this ),

		is_stepping: false,
		id_body_map: {},
		id_constraint_map: {},
		onStep: null,

		initializeWorker: initializeWorker.bind( this ),
		processWorldReport: processWorldReport.bind( this ),
		processCollisionReport: processCollisionReport.bind( this ),
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
		setRigidBodyAngularFactor: setRigidBodyAngularFactor.bind( this ),

		inflight_raytraces: {},
		processRaytraceResults: processRaytraceResults.bind( this )
	};

	this.physics = {
		raytrace: raytrace.bind( this )
	};

	this.physijs.initializeWorker( worker_script_location, world_config );
}

Scene.prototype = Object.create( THREE.Scene.prototype );
Scene.prototype.constructor = Scene;

Scene.prototype.add = function( object ) {
	if ( object instanceof Constraint ) {
		object.scene = this;
		var constraint_definition = object.getConstraintDefinition();
		this.physijs.id_constraint_map[ constraint_definition.constraint_id ] = object;
		// ensure the body(ies) transforms have been set
		this.physijs.setRigidBodyTransform( object.body_a );
		if ( object.body_b != null ) {
			this.physijs.setRigidBodyTransform( object.body_b );
		}
		this.physijs.postMessage( MESSAGE_TYPES.ADD_CONSTRAINT, constraint_definition );
		return;
	}

	THREE.Scene.prototype.add.call( this, object );

	if ( object.physics instanceof _PhysicsObject ) {
		var rigid_body_definition = getRigidBodyDefinition( object );
		this.physijs.id_body_map[ rigid_body_definition.body_id ] = object;
		this.physijs.postMessage( MESSAGE_TYPES.ADD_RIGIDBODY, rigid_body_definition );
		object.updateMatrix();
	}
};

Scene.prototype.remove = function( object ) {
	THREE.Scene.prototype.remove.call( this, object );

	if ( object.physics instanceof _PhysicsObject ) {
		delete this.physijs.id_body_map[ object.physics._.id ];
		this.physijs.postMessage( MESSAGE_TYPES.REMOVE_RIGIDBODY, { body_id: object.physics._.id } );
	}
};

Scene.prototype.step = function( time_delta, max_step, onStep ) {
	if ( this.physijs.is_stepping === true ) {
		throw new Error( 'Physijs: scene is already stepping, cannot call step() until it\'s finished' );
	}

	this.physijs.is_stepping = true;
	this.physijs.onStep = onStep;

	// check if any rigid bodies have been toyed with
	var rigid_body_ids = Object.keys( this.physijs.id_body_map );
	for ( var i = 0; i < rigid_body_ids.length; i++ ) {
		var rigid_body_id = rigid_body_ids[ i ];
		var rigid_body = this.physijs.id_body_map[ rigid_body_id ];
		if ( rigid_body == null ) {
			continue;
		}

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

function raytrace( rays, callback ) {
	var raytrace_id = getUniqueId();

	this.physijs.postMessage(
		MESSAGE_TYPES.RAYTRACE,
		{
			raytrace_id: raytrace_id,
			rays: rays.map(function(ray) {
				return {
					start: {
						x: ray.start.x,
						y: ray.start.y,
						z: ray.start.z
					},
					end: {
						x: ray.end.x,
						y: ray.end.y,
						z: ray.end.z
					}
				};
			})
		}
	);

	this.physijs.inflight_raytraces[ raytrace_id ] = callback;
}

function handleMessage( message, handler ) {
	this.physijs.handlers[message] = handler;
}

function initializeWorker( worker_script_location, world_config ) {
	this.physijs.worker = new Worker( worker_script_location );
	this.physijs.worker.addEventListener(
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

			if ( this.physijs.handlers.hasOwnProperty( type ) ) {
				this.physijs.handlers[type]( parameters );
			} else {
				throw new Error( 'Physijs scene received unknown message type: ' + type );
			}
		}.bind( this )
	);

	this.physijs.handleMessage(
		MESSAGE_TYPES.REPORTS.WORLD,
		this.physijs.processWorldReport
	);

	this.physijs.handleMessage(
		MESSAGE_TYPES.REPORTS.COLLISIONS,
		this.physijs.processCollisionReport
	);

	this.physijs.handleMessage(
		MESSAGE_TYPES.RAYTRACE_RESULTS,
		this.physijs.processRaytraceResults
	);

	this.physijs.postMessage( MESSAGE_TYPES.INITIALIZE, world_config || {} );
}

function processWorldReport( report ) {
	var simulation_ticks = report[1];
	var rigid_body_count = report[2];

	for ( var i = 0; i < rigid_body_count; i++ ) {
		var idx = 3 + i * 30; // [WORLD, # TICKS, # BODIES, n*30 elements ...]
		var rigid_body_id = report[idx++];
		var rigid_body = this.physijs.id_body_map[ rigid_body_id ];
		if ( rigid_body == null ) {
			continue;
		}

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

function processCollisionReport( report ) {
	var new_contacts = report[1];

	for ( var i = 0; i < new_contacts; i += 15 ) {
		var idx = i + 2;
		var object_a = this.physijs.id_body_map[report[idx+0]];
		var object_b = this.physijs.id_body_map[report[idx+1]];

		if ( object_a == null || object_b == null ) {
			debugger;
			continue;
		}

		_tmp_vector3_1.set( report[idx+2], report[idx+3], report[idx+4] );
		_tmp_vector3_2.set( report[idx+5], report[idx+6], report[idx+7] );
		_tmp_vector3_3.set( report[idx+8], report[idx+9], report[idx+10] );
		_tmp_vector3_4.set( report[idx+11], report[idx+12], report[idx+13] );

		object_a.dispatchEvent({
			type: 'physics.newContact',
			other_body: object_b,
			contact_point: _tmp_vector3_1,
			contact_normal: _tmp_vector3_2,
			relative_linear_velocity: _tmp_vector3_3,
			relative_angular_velocity: _tmp_vector3_4,
			penetration_depth: report[idx+14]
		});

		object_b.dispatchEvent({
			type: 'physics.newContact',
			other_body: object_a,
			contact_point: _tmp_vector3_1,
			contact_normal: _tmp_vector3_2,
			relative_linear_velocity: _tmp_vector3_3,
			relative_angular_velocity: _tmp_vector3_4,
			penetration_depth: report[idx+14]
		});
	}

	this.physijs.postReport( report );
}

function postMessage( type, parameters ) {
	this.physijs.worker.postMessage({
		type: type,
		parameters: parameters
	});
}

function postReport( report ) {
	this.physijs.worker.postMessage( report, [report.buffer] );
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

function setRigidBodyRestitution( physics_object ) {
	this.physijs.postMessage(
		MESSAGE_TYPES.SET_RIGIDBODY_RESTITUTION,
		{
			body_id: physics_object._.id,
			restitution: physics_object._.restitution
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

function setRigidBodyLinearDamping( physics_object ) {
	this.physijs.postMessage(
		MESSAGE_TYPES.SET_RIGIDBODY_LINEAR_DAMPING,
		{
			body_id: physics_object._.id,
			damping: physics_object._.linear_damping
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

function setRigidBodyCollisionGroups( physics_object ) {
	this.physijs.postMessage(
		MESSAGE_TYPES.SET_RIGIDBODY_COLLISION_GROUPS,
		{
			body_id: physics_object._.id,
			collision_groups: physics_object._.collision_groups
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

function setRigidBodyLinearVelocity( body ) {
	this.physijs.postMessage(
		MESSAGE_TYPES.SET_RIGIDBODY_LINEAR_VELOCITY,
		{
			body_id: body.physics._.id,
			velocity: { x: body.physics.linear_velocity.x, y: body.physics.linear_velocity.y, z: body.physics.linear_velocity.z }
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

function setRigidBodyLinearFactor( body ) {
	this.physijs.postMessage(
		MESSAGE_TYPES.SET_RIGIDBODY_LINEAR_FACTOR,
		{
			body_id: body.physics._.id,
			factor: { x: body.physics.linear_factor.x, y: body.physics.linear_factor.y, z: body.physics.linear_factor.z }
		}
	);
}

function setRigidBodyAngularFactor( body ) {
	this.physijs.postMessage(
		MESSAGE_TYPES.SET_RIGIDBODY_ANGULAR_FACTOR,
		{
			body_id: body.physics._.id,
			factor: { x: body.physics.angular_factor.x, y: body.physics.angular_factor.y, z: body.physics.angular_factor.z }
		}
	);
}

function processRaytraceResults( response ) {
	var callback = this.physijs.inflight_raytraces[ response.raytrace_id ];
	var scene = this;
	callback(
		response.results.map(function( ray ) {
			return ray.map(function( intersection ) {
				return {
					body: scene.physijs.id_body_map[ intersection.body_id ],
					point: new THREE.Vector3( intersection.point.x, intersection.point.y, intersection.point.z ),
					normal: new THREE.Vector3( intersection.normal.x, intersection.normal.y, intersection.normal.z )
				}
			});
		}, scene)
	);
}