import {getUniqueId} from '../util/UniqueId';

export default function Constraint() {
    this.constraint_id = getUniqueId();
    this.scene = null;
};