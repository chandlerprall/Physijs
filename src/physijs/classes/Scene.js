import MESSAGE_TYPES from '../../MESSAGE_TYPES';
import BODY_TYPES from '../../BODY_TYPES';
import Mesh from './mesh/Mesh';
import CompoundObject from './CompoundObject';

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

export default function Scene( worker_script_location, world_config ) {
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

Scene.prototype.add = function( object ) {
	THREE.Scene.prototype.add.call( this, object );

	if ( object instanceof Mesh || object instanceof CompoundObject ) {
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

function postMessage( type, parameters ) {
	this.physijs.worker.postMessage({
		type: type,
		parameters: parameters
	});
}

function postReport( report ) {
	this.physijs.worker.postMessage( report, [report.buffer] );
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

function setRigidBodyRestitution( mesh ) {
	this.physijs.postMessage(
		MESSAGE_TYPES.SET_RIGIDBODY_RESTITUTION,
		{
			body_id: mesh.physijs.id,
			restitution: mesh.physijs.restitution
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

function setRigidBodyLinearDamping( mesh ) {
	this.physijs.postMessage(
		MESSAGE_TYPES.SET_RIGIDBODY_LINEAR_DAMPING,
		{
			body_id: mesh.physijs.id,
			damping: mesh.physijs.linear_damping
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

function setRigidBodyCollisionGroups( mesh ) {
	this.physijs.postMessage(
		MESSAGE_TYPES.SET_RIGIDBODY_COLLISION_GROUPS,
		{
			body_id: mesh.physijs.id,
			collision_groups: mesh.physijs.collision_groups
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

function setRigidBodyLinearVelocity( body_id, mesh ) {
	this.physijs.postMessage(
		MESSAGE_TYPES.SET_RIGIDBODY_LINEAR_VELOCITY,
		{
			body_id: body_id,
			velocity: { x: mesh.linear_velocity.x, y: mesh.linear_velocity.y, z: mesh.linear_velocity.z }
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

function setRigidBodyLinearFactor( body_id, mesh ) {
	this.physijs.postMessage(
		MESSAGE_TYPES.SET_RIGIDBODY_LINEAR_FACTOR,
		{
			body_id: body_id,
			factor: { x: mesh.linear_factor.x, y: mesh.linear_factor.y, z: mesh.linear_factor.z }
		}
	);
}

function setRigidBodyAngularFactor( body_id, mesh ) {
	this.physijs.postMessage(
		MESSAGE_TYPES.SET_RIGIDBODY_ANGULAR_FACTOR,
		{
			body_id: body_id,
			factor: { x: mesh.angular_factor.x, y: mesh.angular_factor.y, z: mesh.angular_factor.z }
		}
	);
}