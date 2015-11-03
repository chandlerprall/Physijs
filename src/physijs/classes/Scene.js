import MESSAGE_TYPES from '../../MESSAGE_TYPES';
import BODY_TYPES from '../../BODY_TYPES';
import Mesh from './mesh/Mesh';
import SphereMesh from './mesh/SphereMesh';

function getRigidBodyDefinition( mesh ) {
	var body_type;
	var body_definition = {};

	if ( mesh instanceof SphereMesh ) {
		mesh.geometry.computeBoundingSphere(); // make sure bounding radius has been calculated
		body_type = BODY_TYPES.SPHERE;
		body_definition.radius = mesh.geometry.boundingSphere.radius;
	} else {
		throw new Error( 'Physijs: unable to determine rigid body definition for mesh' );
	}

	return {
		body_id: mesh.physijs_id,
		body_type: body_type,
		body_definition: body_definition,
		mass: mesh.mass
	};
}

export default function Scene( worker_script_location, world_config ) {
	THREE.Scene.call( this );
	this.initializeWorker( worker_script_location, world_config );
}

Scene.prototype = Object.create( THREE.Scene.prototype );
Scene.prototype.constructor = Scene;

Scene.prototype.initializeWorker = function( worker_script_location, world_config ) {
	this.worker = new Worker( worker_script_location );
	this.worker.addEventListener(
		'message',
		function() {
			console.log('scene got message with', arguments);
		}
	);
	this.postMessage( MESSAGE_TYPES.INITIALIZE, world_config || {} );
};

Scene.prototype.postMessage = function( type, parameters ) {
	this.worker.postMessage({
		type: type,
		parameters: parameters
	});
};

Scene.prototype.add = function( object ) {
	THREE.Scene.prototype.add.call( this, object );

	if ( object instanceof Mesh ) {
		this.postMessage(
			MESSAGE_TYPES.ADD_RIGIDBODY, getRigidBodyDefinition( object )
		);
	}
};

Scene.prototype.setRigidBodyMass = function( mesh, mass ) {
	this.postMessage(
		MESSAGE_TYPES.SET_RIGIDBODY_MASS,
		{
			body_id: mesh.physijs_id,
			mass: mass
		}
	);
};