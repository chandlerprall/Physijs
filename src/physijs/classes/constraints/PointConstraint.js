import CONSTRAINT_TYPES from '../../../CONSTRAINT_TYPES';
import Constraint from './Constraint';

export default function PointConstraint( body_a, point_a, body_b, point_b ) {
    Constraint.call( this );

    this.body_a = body_a;
    this.point_a = point_a;
    this.body_b = body_b;
    this.point_b = point_b;
}

PointConstraint.prototype = Object.create( Constraint.prototype );
PointConstraint.prototype.constructor = PointConstraint;

PointConstraint.prototype.getConstraintDefinition = function() {
    return {
        constraint_type: CONSTRAINT_TYPES.POINT,
        constraint_id: this.constraint_id,
        body_a_id: this.body_a.physics._.id,
        point_a: { x: this.point_a.x, y: this.point_a.y, z: this.point_a.z },
        body_b_id: this.body_b == null ? null : this.body_b.physics._.id,
        point_b: this.body_b == null ? null : { x: this.point_b.x, y: this.point_b.y, z: this.point_b.z },

        active: this.physics.active,
        factor: this.physics.factor,
        breaking_threshold: this.physics.breaking_threshold,
    };
};