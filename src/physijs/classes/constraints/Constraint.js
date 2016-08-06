import {getUniqueId} from '../util/UniqueId';

export default function Constraint() {
    this.constraint_id = getUniqueId();
    this.scene = null;

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
};