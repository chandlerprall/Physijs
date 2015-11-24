import BODY_TYPES from '../../../BODY_TYPES';
import Mesh from './Mesh';

export default function SphereMesh( geometry, material, physics_descriptor ) {
	Mesh.call( this, geometry, material, physics_descriptor );
}

SphereMesh.prototype = Object.create( Mesh.prototype );
SphereMesh.prototype.constructor = SphereMesh;

SphereMesh.prototype.getShapeDefinition = function() {
	this.geometry.computeBoundingSphere(); // make sure bounding radius has been calculated

	return {
		body_type: BODY_TYPES.SPHERE,
		radius: this.geometry.boundingSphere.radius
	};
};