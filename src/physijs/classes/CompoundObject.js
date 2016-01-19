import BODY_TYPES from '../../BODY_TYPES';
import PhysicsObject, {_PhysicsObject, clone} from './PhysicsObject';

export default function CompoundObject( object, physics_descriptor ) {
	if ( physics_descriptor == null ) {
		throw new Error( 'Physijs: attempted to create rigid body without specifying physics details' );
	}

	if ( object.physics instanceof _PhysicsObject ) {
		object.physics.getShapeDefinition = getShapeDefinition.bind( null, object, object.physics.getShapeDefinition );
	} else {
		object.physics = new _PhysicsObject( object, null, physics_descriptor, getShapeDefinition.bind( null, object ) );
	}

	object.rotationAutoUpdate = false;
	object.matrixAutoUpdate = false;

	object.clone = clone.bind( object, object.clone );

	return object;
}


function getShapeDefinition( object, originalShapeDefinition ) {
	var shapes = [];

	var position_offset = new THREE.Vector3();
	var quaternion_offset = new THREE.Quaternion();

	object.updateMatrix();
	object.updateMatrixWorld( true );
	var parent_inverse_world = new THREE.Matrix4().getInverse( object.matrixWorld );
	var childMatrix = new THREE.Matrix4();

	object.traverse(function( child ) {
		child.updateMatrix();
		child.updateMatrixWorld( true );

		if ( child.physics instanceof _PhysicsObject ) {
			var shapeDefinition;
			if ( originalShapeDefinition != null ) {
				shapeDefinition = originalShapeDefinition( child.physics.geometry );
			} else if ( object !== child ) {
				shapeDefinition = child.physics.getShapeDefinition( child.physics.geometry );
			}

			if ( shapeDefinition != null ) {
				childMatrix.copy( child.matrixWorld ).multiply( parent_inverse_world );
				position_offset.setFromMatrixPosition( childMatrix );
				quaternion_offset.setFromRotationMatrix( childMatrix );
				shapes.push({
					position: {x: position_offset.x, y: position_offset.y, z: position_offset.z},
					quaternion: {
						x: quaternion_offset._x,
						y: quaternion_offset._y,
						z: quaternion_offset._z,
						w: quaternion_offset._w
					},
					shape_definition: shapeDefinition
				});
			}
		}
	});

	return {
		body_type: BODY_TYPES.COMPOUND,
		shapes: shapes
	};
}