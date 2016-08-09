import CONSTRAINT_TYPES from '../../../CONSTRAINT_TYPES';
import Constraint from './Constraint';

export default function SliderConstraint( body_a, axis_a, body_b ) {
    Constraint.call( this );

    this.body_a = body_a;
    this.axis_a = axis_a;
    this.body_b = body_b;
}

SliderConstraint.prototype = Object.create( Constraint.prototype );
SliderConstraint.prototype.constructor = SliderConstraint;

SliderConstraint.prototype.getConstraintDefinition = function() {
    return {
        constraint_type: CONSTRAINT_TYPES.SLIDER,
        constraint_id: this.constraint_id,
        body_a_id: this.body_a.physics._.id,
		axis_a: { x: this.axis_a.x, y: this.axis_a.y, z: this.axis_a.z },
        body_b_id: this.body_b == null ? null : this.body_b.physics._.id,

        active: this.physics.active,
        factor: this.physics.factor,
        breaking_threshold: this.physics.breaking_threshold,
    };
};