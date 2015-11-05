import MESSAGE_TYPES from '../../MESSAGE_TYPES';
import BODY_TYPES from '../../BODY_TYPES';
import Mesh from './mesh/Mesh';
import BoxMesh from './mesh/BoxMesh';
import SphereMesh from './mesh/SphereMesh';

function getRigidBodyDefinition( mesh ) {
	var body_type;
	var body_definition = {};

	if ( mesh instanceof SphereMesh ) {
		mesh.geometry.computeBoundingSphere(); // make sure bounding radius has been calculated
		body_type = BODY_TYPES.SPHERE;
		body_definition.radius = mesh.geometry.boundingSphere.radius;
	} else if ( mesh instanceof BoxMesh ) {
		mesh.geometry.computeBoundingBox(); // make sure bounding radius has been calculated
		body_type = BODY_TYPES.BOX;
		body_definition.width = mesh.geometry.boundingBox.max.x;
		body_definition.height = mesh.geometry.boundingBox.max.y;
		body_definition.depth = mesh.geometry.boundingBox.max.z;
	} else {
		throw new Error( 'Physijs: unable to determine rigid body definition for mesh' );
	}

	return {
		body_id: mesh.physijs.id,
		body_type: body_type,
		body_definition: body_definition,
		mass: mesh.physijs.mass
	};
}

export default function Scene( worker_script_location, world_config ) {
	THREE.Scene.call( this );
	this.initializeWorker( worker_script_location, world_config );
	this.physijs = {
		is_stepping: false,
		id_rigid_body_map: {},
		onStep: null
	};
}

Scene.prototype = Object.create( THREE.Scene.prototype );
Scene.prototype.constructor = Scene;

Scene.prototype.initializeWorker = function( worker_script_location, world_config ) {
	this.worker = new Worker( worker_script_location );
	this.worker.addEventListener(
		'message',
		function(e) {
			var data = e.data;

			if ( data instanceof Float32Array ) {
				// it's a report
				var report_type = data[0];
				if ( report_type === MESSAGE_TYPES.REPORTS.WORLD ) {
					this.processWorldReport( data );
				}
			}
		}.bind( this )
	);
	this.postMessage( MESSAGE_TYPES.INITIALIZE, world_config || {} );
};

Scene.prototype.processWorldReport = function( report ) {
	var rigid_body_count = report[1];

	for ( var i = 0; i < rigid_body_count; i++ ) {
		var idx = 2 + i * 17; // [WORLD, # BODIES, n*17 elements ...]
		var rigid_body_id = report[idx++];
		var rigid_body = this.physijs.id_rigid_body_map[ rigid_body_id ];

		rigid_body.matrix.set(
			report[idx++], report[idx++], report[idx++], report[idx++],
			report[idx++], report[idx++], report[idx++], report[idx++],
			report[idx++], report[idx++], report[idx++], report[idx++],
			report[idx++], report[idx++], report[idx++], report[idx++]
		);
	}

	// send the buffer back for re-use
	this.postReport( report );

	// world report is over, we're no longer stepping
	this.physijs.is_stepping = false;
	if ( this.physijs.onStep instanceof Function ) {
		var onStep = this.physijs.onStep;
		this.physijs.onStep = null;
		onStep.call( this );
	}
};

Scene.prototype.postMessage = function( type, parameters ) {
	this.worker.postMessage({
		type: type,
		parameters: parameters
	});
};

Scene.prototype.postReport = function( report ) {
	this.worker.postMessage( report, [report.buffer] );
};

Scene.prototype.add = function( object ) {
	THREE.Scene.prototype.add.call( this, object );

	if ( object instanceof Mesh ) {
		var rigid_body_definition = getRigidBodyDefinition( object );
		this.physijs.id_rigid_body_map[ rigid_body_definition.body_id ] = object;
		this.postMessage( MESSAGE_TYPES.ADD_RIGIDBODY, rigid_body_definition );
		this.postMessage(
			MESSAGE_TYPES.SET_RIGIDBODY_TRANSFORM,
			{
				body_id: rigid_body_definition.body_id,
				position: { x: object.position.x, y: object.position.y, z: object.position.z },
				rotation: { x: object.quaternion.x, y: object.quaternion.y, z: object.quaternion.z, w: object.quaternion.w }
			}
		);
	}
};

Scene.prototype.setRigidBodyMass = function( mesh ) {
	this.postMessage(
		MESSAGE_TYPES.SET_RIGIDBODY_MASS,
		{
			body_id: mesh.physijs.id,
			mass: mesh.physijs.mass
		}
	);
};

Scene.prototype.step = function( time_delta, max_step, onStep ) {
	if ( this.physijs.is_stepping === true ) {
		throw new Error( 'Physijs: scene is already stepping, cannot call step() until it\'s finished' );
	}

	this.physijs.is_stepping = true;
	this.physijs.onStep = onStep;

	this.postMessage(
		MESSAGE_TYPES.STEP_SIMULATION,
		{
			time_delta: time_delta,
			max_step: max_step
		}
	);
};