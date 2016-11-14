import {getUniqueId} from '../util/UniqueId';

export default function Constraint() {
    this.constraint_id = getUniqueId();

	this.physics = {
		active: true,
		factor: 1,
		breaking_threshold: 0,
		last_impulse: new THREE.Vector3(),
		limit: {
			enabled: false,
			lower: null,
			upper: null
		},
		motor: {
			enabled: false,
			torque: null,
			max_speed: null
		},

		_: {
			active: true,
			factor: 1,
			breaking_threshold: 0,
			limit: {
				enabled: false,
				lower: null,
				upper: null
			},
			motor: {
				enabled: false,
				torque: null,
				max_speed: null
			},
		}
	};
}

Constraint.prototype = Object.create( THREE.EventDispatcher.prototype );

Constraint.prototype.setActive = function( active ) {
	this.physics.active = active;
};