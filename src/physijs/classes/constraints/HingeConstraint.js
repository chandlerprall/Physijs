import CONSTRAINT_TYPES from '../../../CONSTRAINT_TYPES';
import Constraint from './Constraint';

export default function HingeConstraint( body_a, hinge_axis, point_a, body_b, point_b ) {
    Constraint.call( this );

    this.body_a = body_a;
    this.hinge_axis = hinge_axis;
    this.point_a = point_a;
    this.body_b = body_b;
    this.point_b = point_b;
}

HingeConstraint.prototype = Object.create( Constraint.prototype );
HingeConstraint.prototype.constructor = HingeConstraint;

HingeConstraint.prototype.getConstraintDefinition = function() {
    return {
        constraint_type: CONSTRAINT_TYPES.HINGE,
        constraint_id: this.constraint_id,
        body_a_id: this.body_a.physics._.id,
        hinge_axis: { x: this.hinge_axis.x, y: this.hinge_axis.y, z: this.hinge_axis.z },
        point_a: { x: this.point_a.x, y: this.point_a.y, z: this.point_a.z },
        body_b_id: this.body_b == null ? null : this.body_b.physics._.id,
        point_b: this.body_b == null ? null : { x: this.point_b.x, y: this.point_b.y, z: this.point_b.z },

        active: this.physics.active,
        factor: this.physics.factor,
        breaking_threshold: this.physics.breaking_threshold,
        limit: {
            enabled: this.physics.limit.enabled,
            lower: this.physics.limit.lower,
            upper: this.physics.limit.upper
        },
        motor: {
            enabled: this.physics.motor.enabled,
            torque: this.physics.motor.torque,
            max_speed: this.physics.motor.max_speed
        }
    };
};

HingeConstraint.prototype.setLimit = function( lower, upper ) {
    this.physics.limit.enabled = lower != null || upper != null;
    this.physics.limit.lower = lower;
    this.physics.limit.upper = upper;
};

HingeConstraint.prototype.setMotor = function( torque, max_speed ) {
    this.physics.motor.enabled = torque != null || max_speed != null;
    this.physics.motor.torque = torque;
    this.physics.motor.max_speed = max_speed;
};