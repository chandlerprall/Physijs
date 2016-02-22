"use strict";
var
	transferableMessage = self.webkitPostMessage || self.postMessage,

	// enum
	MESSAGE_TYPES = {
		WORLDREPORT: 0,
		COLLISIONREPORT: 1,
		VEHICLEREPORT: 2,
		CONSTRAINTREPORT: 3
	},

	// Temporary variables
	_object,
	_vector,
	_transform,

	// Functions
	public_functions = {},
	getShapeFromCache,
	setShapeCache,
	createShape,
	stepWorld,
	reportWorld,
	reportVehicles,
	reportCollisions,
	reportConstraints,

	// World variables
	fixedTimeStep, // used when calling stepSimulation
	rateLimit, // sets whether or not to sync the simulation rate with fixedTimeStep
	last_simulation_time,
	last_simulation_duration = 0,
	world,
	transform,
	_vec3_1,
	_vec3_2,
	_vec3_3,
	_quat,
	// private cache
	_objects = {},
	_vehicles = {},
	_constraints = {},
	_materials = {},
	_num_objects = 0,
	_contacts = [], // Special case
	_num_wheels = 0,
	_num_constraints = 0,
	_object_shapes = {},
    _noncached_shapes = {},
    _compound_shapes = {},

	// object reporting
	REPORT_CHUNKSIZE, // report array is increased in increments of this chunk size

	WORLDREPORT_ITEMSIZE = 14, // how many float values each reported item needs
	worldreport,

	COLLISIONREPORT_ITEMSIZE = 5, // one float for each object id, and a Vec3 contact normal
	collisionreport,

	VEHICLEREPORT_ITEMSIZE = 9, // vehicle id, wheel index, 3 for position, 4 for rotation
	vehiclereport,

	CONSTRAINTREPORT_ITEMSIZE = 6, // constraint id, offset object, offset, applied impulse
	constraintreport;

var ab = new ArrayBuffer(1);

transferableMessage(ab, [ab]);
var SUPPORT_TRANSFERABLE =(ab.byteLength === 0);

getShapeFromCache = function(cache_key){
	if(_object_shapes[cache_key] !== undefined){
		return _object_shapes[cache_key];
	}
	return null;
};

setShapeCache = function(cache_key, shape){
	if(shape !== undefined){
		_object_shapes[cache_key] = shape;
	}
}

createShape = function(description){
	var cache_key, shape;

	switch(description.type){
		case "plane":
			cache_key = "plane_" + description.normal.x + "_" + description.normal.y + "_" + description.normal.z;
			if((shape = getShapeFromCache(cache_key)) === null){
				shape = new CANNON.Plane(new CANNON.Vec3(description.normal.x, description.normal.z, description.normal.y));
				setShapeCache(cache_key, shape);
			}
		break;
		case "box":
			cache_key = "box_" + description.width + "_" + description.height + "_" + description.depth;
			if((shape = getShapeFromCache(cache_key)) === null){
				shape = new CANNON.Box(new CANNON.Vec3(description.width / 2, description.depth / 2, description.height / 2));
				setShapeCache(cache_key, shape);
			}
		break;
		case "sphere":
			cache_key = "sphere_" + description.radius;
			if((shape = getShapeFromCache(cache_key)) === null){
				shape = new CANNON.Sphere(description.radius);
				setShapeCache(cache_key, shape);
			}
		break;
		case "cylinder":
			cache_key = "cylinder_" + description.radius + "_" + description.height;
			if((shape = getShapeFromCache(cache_key)) === null){
				shape = new CANNON.Cylinder(description.radius, description.radius, description.height, 10);
				setShapeCache(cache_key, shape);
			}
		break;
		case "cone":
			cache_key = "cone_" + description.radius + "_" + description.height;
			if((shape = getShapeFromCache(cache_key)) === null){
				shape = new CANNON.Cylinder(0, description.radius, description.height, 10);
				setShapeCache(cache_key, shape);
			}
		break;
		case "concave":
			var i, j, f, l, triangle, vertices = [], indices = [];
			if(!(l = description.triangles.length)){
				return false;
			}

			for(i = j = 0; i < l; i++){
				triangle = description.triangles[i];

				vertices[j] = triangle[0].x;
				vertices[j + 1] = triangle[0].y;
				vertices[j + 2] = triangle[0].z;
				vertices[j + 3] = triangle[1].x;
				vertices[j + 4] = triangle[1].y;
				vertices[j + 5] = triangle[1].z;
				vertices[j + 6] = triangle[2].x;
				vertices[j + 7] = triangle[2].y;
				vertices[j + 8] = triangle[2].z;

				for(f = j; f < 3; f++){
					indices[f] = f;
				}

				j += triangle.length * 3;
			}

			shape = new CANNON.Trimesh(vertices, indices);
			_noncached_shapes[description.id] = shape;
		break;
		case "convex":
			return false; // #TODO: Add support for convex meshes
		break;
		case "heightfield":
			shape = new CANNON.Heightfield(description.ypts, {elementSize: description.ysize});
			_noncached_shapes[description.id] = shape;
		break;
		default: // Not recognized
			return;
		break;
	}

	return shape;
};

public_functions.init = function(params){
	importScripts(params.cannon);

	_vec3_1 = new CANNON.Vec3(0, 0, 0);
	_vec3_2 = new CANNON.Vec3(0, 0, 0);
	_vec3_3 = new CANNON.Vec3(0, 0, 0);
	_quat = new CANNON.Quaternion(0, 0, 0, 0);

	REPORT_CHUNKSIZE = params.reportsize || 50;
	if(SUPPORT_TRANSFERABLE){ // Supported transferables
		worldreport = new Float32Array(2 + REPORT_CHUNKSIZE * WORLDREPORT_ITEMSIZE);
		collisionreport = new Float32Array(2 + REPORT_CHUNKSIZE * COLLISIONREPORT_ITEMSIZE);
		vehiclereport = new Float32Array(2 + REPORT_CHUNKSIZE * VEHICLEREPORT_ITEMSIZE);
		constraintreport = new Float32Array(2 + REPORT_CHUNKSIZE * CONSTRAINTREPORT_ITEMSIZE);
	} else { // Unsupported transferables
		worldreport = collisionreport = vehiclereport = constraintreport = [];
	}

	// Define message types(always first)
	worldreport[0] = MESSAGE_TYPES.WORLDREPORT;
	collisionreport[0] = MESSAGE_TYPES.COLLISIONREPORT;
	vehiclereport[0] = MESSAGE_TYPES.VEHICLEREPORT;
	constraintreport[0] = MESSAGE_TYPES.CONSTRAINTREPORT;

	// Scene setup variables
	var broadphase;

	params.broadphase = params.broadphase || {type: "normal"};
	switch(params.broadphase.type){
		case "sweepprune":
			broadphase = new CANNON.SAPBroadphase;
		break;
		case "normal":
		default:
			broadphase = new CANNON.NaiveBroadphase;
		break;
	}

	world = new CANNON.World;
	world.broadphase = broadphase;

	fixedTimeStep = params.fixedTimeStep;
	transferableMessage({cmd: "worldReady"});
};

public_functions.registerMaterial = function(description){
	var material = new CANNON.Material;
	material.friction = description.friction;
	material.restitution = description.restitution;
	_materials[description.id] = material;
};

public_functions.unRegisterMaterial = function(description){
	delete _materials[description.id];
};

public_functions.setFixedTimeStep = function(description){
	fixedTimeStep =(typeof description === "number") ? description : fixedTimeStep || 1 / 60;
};

public_functions.setGravity = function(description){
	world.gravity.set(description.x, description.z, description.y);
};

public_functions.addObject = function(description){
	var i, shape, body, config;

	if(!(shape = createShape(description)))return;

	config = {
		position: new CANNON.Vec3(description.position.x, description.position.z, description.position.y),
		quaternion: new CANNON.Quaternion(description.rotation.x, description.rotation.z, description.rotation.y, description.rotation.w),
		material: _materials[description.materialId],
		mass: description.mass,
		shape: shape
	};

	if(description.children){
		var _compound = new CANNON.Body(config), _child;

		for(i = 0; i < description.children.length; i++){
			_child = description.children[i];

			_vec3_1.set(_child.position_offset.x, _child.position_offset.z, _child.position_offset.y);
			_quat.set(_child.rotation.x, _child.rotation.z, _child.rotation.y, _child.rotation.w);

			shape = createShape(description.children[i]);
			_compound.addShape(shape, vec3_1, _quat);
		}

		body = _compound;
	}
	shape.calculateLocalInertia(description.mass, _vec3_1.setZero());

	body = body || new CANNON.Body(config);
	_vec3_1.set(description.position.x, description.position.z, description.position.y);
	body.initPosition.copy(_vec3_1);

	_quat.set(description.rotation.x, description.rotation.z, description.rotation.y, description.rotation.w);
	body.initQuaternion.copy(_quat);

	_vec3_1.setZero();
	body.initVelocity.copy(_vec3_1);
	body.initAngularVelocity.copy(_vec3_1);

	world.addBody(body);

	body.sid = description.id; // Used in reports
	_objects[body.sid] = body;
	_num_objects++;

	transferableMessage({cmd: "objectReady", params: description.id});
};

public_functions.reset = function(details){
	var index, body;

	// Reset a body or all bodies
	if(details.id){
		body = _objects[index];

		_vec3_1.setZero();
		body.position.copy(body.initPosition);
		body.velocity.copy(_vec3_1);

		body.quaternion.copy(body.initQuaternion);
		body.angularVelocity.copy(_vec3_1);
	} else {
		for(index in _objects){
			if(_objects.hasOwnProperty(index)){
				body = _objects[index];
			}

			_vec3_1.setZero();
			body.position.copy(body.initPosition);
			body.velocity.copy(_vec3_1);

			body.quaternion.copy(body.initQuaternion);
			body.angularVelocity.copy(_vec3_1);
		}
	}
};

public_functions.addVehicle = function(description){
	var vehicle = new CANNON.RaycastVehicle({chassisBody: _objects[description.rigidBody]});
	vehicle.tuning = description.tuning;

	_vehicles[description.id] = vehicle;
	vehicle.addToWorld(world);
};

public_functions.removeVehicle = function(description){
	_vehicles[description.id].removeFromWorld(world);
	delete _vehicles[description.id];
};

public_functions.addWheel = function(description){
	if(_vehicles[description.id] !== undefined){
		var tn =(description.tuning !== undefined) ? description.tuning : _vehicles[description.id].tuning;

		_vec3_1.set(description.connection_point.x, description.connection_point.z, description.connection_point.y);
		_vec3_2.set(description.wheel_direction.x, description.wheel_direction.z, description.wheel_direction.y);
		_vec3_3.set(description.wheel_axle.x, description.wheel_axle.z, description.wheel_axle.y);

		_vehicles[description.id].addWheel({
			chassisConnectionPointLocal: _vec3_1,
			directionLocal: _vec3_2,
			axleLocal: _vec3_3,
			suspensionStiffness: tn.suspension_stiffness,
			dampingCompression: tn.suspension_compression,
			dampingRelaxation: tn.suspension_damping,
			maxSuspensionTravel: tn.max_suspension_travel,
			maxSuspensionForce: tn.max_suspension_force,
			rollInfluence: tn.roll_influence,
			suspensionRestLength: description.suspension_rest_length,
			radius: description.wheel_radius
		});
	}

	_num_wheels++;
};

public_functions.setSteering = function(details){
	if(_vehicles[details.id] !== undefined){
		_vehicles[details.id].setSteeringValue(details.steering, details.wheel);
	}
};

public_functions.setBrake = function(details){
	if(_vehicles[details.id] !== undefined){
		_vehicles[details.id].setBrake(details.brake, details.wheel);
	}
};

public_functions.applyEngineForce = function(details){
	if(_vehicles[details.id] !== undefined){
		_vehicles[details.id].applyEngineForce(details.force, details.wheel);
	}
};

public_functions.removeObject = function(details){
	world.removeBody(_objects[details.id]);
};

public_functions.updateTransform = function(details){
	if(details.pos)_objects[details.id].position.set(details.pos.x, details.pos.z, details.pos.y);
	if(details.quat)_objects[details.id].quaternion.set(details.quat.x, details.quat.z, details.quat.y, details.quat.w);
};

public_functions.updateMass = function(details){
	_objects[details.id].mass = details.mass;
	_objects[details.id].updateMassProperties();
};

public_functions.applyCentralImpulse = function(details){
	_vec3_1.set(details.x, details.z, details.y);
	_objects[details.id].applyCentralImpulse(_vec3_1);
};

public_functions.applyImpulse = function(details){
	_vec3_1.set(details.impulse_x, details.impulse_z, details.impulse_y);
	_vec3_2.set(details.x, details.z, details.y);
	_objects[details.id].applyImpulse(_vec3_1, _vec3_2);
};

public_functions.applyTorque = function(details){
	_vec3_1.set(details.torque_x, details.torque_z, details.torque_y);
	_objects[details.id].applyTorque(_vec3_1);
};

public_functions.applyCentralForce = function(details){
	_vec3_1.set(details.x, details.z, details.y);
	_objects[details.id].applyCentralForce(_vec3_1);
};

public_functions.applyForce = function(details){
	_vec3_1.set(details.force_x, details.force_z, details.force_y);
	_vec3_2.set(details.x, details.z, details.y);
	_objects[details.id].applyForce(_vec3_1, _vec3_2);
};

public_functions.onSimulationResume = function(params){
	last_simulation_time = Date.now(); // Reset the simulation time frame
};

public_functions.setAngularVelocity = function(details){
	_objects[details.id].angularVelocity.set(details.x, details.z, details.y);
};

public_functions.setLinearVelocity = function(details){
	_objects[details.id].velocity.set(details.x, details.z, details.y);
};

public_functions.setDamping = function(details){
	_objects[details.id].angularDamping = details.angular;
	_objects[details.id].linearDamping = details.linear;
};

public_functions.simulate = function(params){
	if(world){
		stepWorld(params);

		// Report stuff
		reportVehicles();
		reportCollisions();
		reportConstraints();
		reportWorld();

		last_simulation_duration =(Date.now() - last_simulation_duration) / 1000;
		last_simulation_time = Date.now();
	}
};

public_functions.addConstraint = function(details){
	var constraint;

	switch(details.type){
		case "point":
			if(details.objectb === undefined){
				_vec3_1.set(details.positiona.x, details.positiona.z, details.positiona.y);

				constraint = new CANNON.PointToPointConstraint(
					_objects[details.objecta],
					undefined,
					_vec3_1
				);
			} else {
				_vec3_1.set(details.positiona.x, details.positiona.z, details.positiona.y);
				_vec3_2.set(details.positionb.x, details.positionb.z, details.positionb.y);

				constraint = new CANNON.PointToPointConstraint(
					_objects[details.objecta],
					_objects[details.objectb],
					_vec3_1,
					_vec3_2
				);
			}
		break;
		case "hinge":
			var config;
			if(details.objectb === undefined){
				_vec3_1.set(details.positiona.x, details.positiona.z, details.positiona.y);
				_vec3_2.set(details.axis.x, details.axis.z, details.axis.y);

				config = {
					pivotA: _vec3_1,
					axisA: _vec3_2
				};

				constraint = new CANNON.HingeConstraint(
					_objects[details.objecta],
					undefined,
					config
				);
			} else {
				_vec3_1.set(details.positiona.x, details.positiona.z, details.positiona.y);
				_vec3_2.set(details.positionb.x, details.positionb.z, details.positionb.y);
				_vec3_3.set(details.axis.x, details.axis.z, details.axis.y);

				config = {
					pivotA: _vec3_1,
					pivotB: _vec3_2,
					axisA: _vec3_3,
					axisB: _vec3_3
				};

				constraint = new CANNON.HingeConstraint(
					_objects[details.objecta],
					_objects[details.objectb],
					config
				);
			}
		break;
		case "spring": // A spring is technically a constraint
			var config;

			_vec3_1.set(details.positiona.x, details.positiona.z, details.positiona.y);
			_vec3_2.set(details.positionb.x, details.positionb.z, details.positionb.y);

			config = {
				stiffness: details.stiffness,
				damping: details.damping,
				restLength: details.rest_length,
				localAnchorA: _vec3_1,
				localAnchorB: _vec3_2
			};

			constraint = new CANNON.Spring(
				_objects[details.objecta],
				_objects[details.objectb],
				config
			);
		break;
		default:
			return;
		break;
	};

	world.addConstraint(constraint);

	_constraints[details.id] = constraint;
	_num_constraints++;

	if(SUPPORT_TRANSFERABLE){
		constraintreport = new Float32Array(1 + _num_constraints * CONSTRAINTREPORT_ITEMSIZE); // message id &(# of objects to report * # of values per object)
		constraintreport[0] = MESSAGE_TYPES.CONSTRAINTREPORT;
	} else {
		constraintreport = [MESSAGE_TYPES.CONSTRAINTREPORT];
	}
};

stepWorld = function(params){
	params = params || {};

	if(!params.timeStep){
		if(last_simulation_time){
			params.timeStep = 0;
			while(params.timeStep + last_simulation_duration <= fixedTimeStep){
				params.timeStep =(Date.now() - last_simulation_time) / 1000; // Time since last simulation
			}
		} else {
			params.timeStep = fixedTimeStep; // Handle first frame
		}
	} else {
		if(params.timeStep < fixedTimeStep){
			params.timeStep = fixedTimeStep;
		}
	}

	params.maxSubSteps = params.maxSubSteps || Math.ceil(params.timeStep / fixedTimeStep);
	last_simulation_duration = Date.now();
	world.step(fixedTimeStep, last_simulation_time, params.maxSubSteps);
};

reportWorld = function(){
	var index, object, origin, rotation, offset = 0, i = 0;

	if(SUPPORT_TRANSFERABLE){
		if(worldreport.length < 2 + _num_objects * WORLDREPORT_ITEMSIZE){
			worldreport = new Float32Array(
				2 + // message id & # objects in report
				(Math.ceil(_num_objects / REPORT_CHUNKSIZE) * REPORT_CHUNKSIZE) * WORLDREPORT_ITEMSIZE // # of values needed * item size
			);
			worldreport[0] = MESSAGE_TYPES.WORLDREPORT;
		}
	}

	worldreport[1] = _num_objects;
	for(index in _objects){
		if(_objects.hasOwnProperty(index)){
			object = _objects[index];

			origin = object.position;
			rotation = object.quaternion;

			// Add values to report
			offset = 2 +(i++) * WORLDREPORT_ITEMSIZE;
			worldreport[offset] = object.sid;

			worldreport[offset + 1] = origin.x;
			worldreport[offset + 2] = origin.z;
			worldreport[offset + 3] = origin.y;

			worldreport[offset + 4] = rotation.x;
			worldreport[offset + 5] = rotation.z;
			worldreport[offset + 6] = rotation.y;
			worldreport[offset + 7] = rotation.w;

			_vector = object.velocity; // Linear velocity
			worldreport[offset + 8] = _vector.x;
			worldreport[offset + 9] = _vector.z;
			worldreport[offset + 10] = _vector.y;

			_vector = object.angularVelocity; // Angular velocity
			worldreport[offset + 11] = _vector.x;
			worldreport[offset + 12] = _vector.z;
			worldreport[offset + 13] = _vector.y;
		}
	}

	if(SUPPORT_TRANSFERABLE){
		transferableMessage(worldreport.buffer, [worldreport.buffer]);
	} else {
		transferableMessage(worldreport);
	}
};

reportCollisions = function(){
	var i, offset, num = _contacts.length;

	if(SUPPORT_TRANSFERABLE){
		if(collisionreport.length < 2 + num * COLLISIONREPORT_ITEMSIZE){
			collisionreport = new Float32Array(2 +(Math.ceil(_num_objects / REPORT_CHUNKSIZE) * REPORT_CHUNKSIZE) * COLLISIONREPORT_ITEMSIZE);
			collisionreport[0] = MESSAGE_TYPES.COLLISIONREPORT;
		}
	}

	collisionreport[1] = num; // how many collisions we"re reporting on

	for(i = 0; i < num; i++){
		offset = 2 +(collisionreport[1]++) * COLLISIONREPORT_ITEMSIZE;
		collisionreport[offset] = _objects[_contacts[i].body0];
		collisionreport[offset + 1] = _objects[_contacts[i].body1];

		// #TODO: Must destroy extra offset indexes, they are no need here
		collisionreport[offset + 2] = 0;
		collisionreport[offset + 3] = 0;
		collisionreport[offset + 4] = 0;
	}

	_contacts = []; // Reset array for next frame
	if(SUPPORT_TRANSFERABLE){
		transferableMessage(collisionreport.buffer, [collisionreport.buffer]);
	} else {
		transferableMessage(collisionreport);
	}
};

reportVehicles = function(){
	var index, vehicle, transform, origin, rotation, offset = 0, i = 0, j = 0;

	if(SUPPORT_TRANSFERABLE){
		if(vehiclereport.length < 2 + _num_wheels * VEHICLEREPORT_ITEMSIZE){
			vehiclereport = new Float32Array(2 +(Math.ceil(_num_wheels / REPORT_CHUNKSIZE) * REPORT_CHUNKSIZE) * VEHICLEREPORT_ITEMSIZE);
			vehiclereport[0] = MESSAGE_TYPES.VEHICLEREPORT;
		}
	}

	for(index in _vehicles){
		if(_vehicles.hasOwnProperty(index)){
			vehicle = _vehicles[index];

			for(j = 0; j < vehicle.getNumWheels(); j++){
				transform = vehicle.getWheelTransformWorld(j);

				origin = transform.position;
				rotation = transform.quaternion;

				// Add values to report
				offset = 1 +(i++) * VEHICLEREPORT_ITEMSIZE;

				vehiclereport[offset] = index;
				vehiclereport[offset + 1] = j;

				vehiclereport[offset + 2] = origin.x;
				vehiclereport[offset + 3] = origin.z;
				vehiclereport[offset + 4] = origin.y;

				vehiclereport[offset + 5] = rotation.x;
				vehiclereport[offset + 6] = rotation.z;
				vehiclereport[offset + 7] = rotation.y;
				vehiclereport[offset + 8] = rotation.w;
			}
		}
	}

	if(j !== 0){
		if(SUPPORT_TRANSFERABLE){
			transferableMessage(vehiclereport.buffer, [vehiclereport.buffer]);
		} else {
			transferableMessage(vehiclereport);
		}
	}
};

reportConstraints = function(){
	var index, constraint, offset_body, origin, offset = 0, i = 0;

	if(SUPPORT_TRANSFERABLE){
		if(constraintreport.length < 2 + _num_constraints * CONSTRAINTREPORT_ITEMSIZE){
			constraintreport = new Float32Array(2 + (Math.ceil(_num_constraints / REPORT_CHUNKSIZE) * REPORT_CHUNKSIZE) * CONSTRAINTREPORT_ITEMSIZE);
			constraintreport[0] = MESSAGE_TYPES.CONSTRAINTREPORT;
		}
	}

	for(index in _constraints){
		if(_constraints.hasOwnProperty(index)){
			constraint = _constraints[index];
			offset_body = constraint.bodyA;
			origin = offset_body.position;

			offset = 1 + (i++) * CONSTRAINTREPORT_ITEMSIZE;

			constraintreport[offset] = index;
			constraintreport[offset + 1] = offset_body.id;
			constraintreport[offset + 2] = origin.x;
			constraintreport[offset + 3] = origin.z;
			constraintreport[offset + 4] = origin.y;
			constraintreport[offset + 5] = Math.abs(constraint.equations[0].multiplier);
		}
	}

	if(i !== 0){
		if(SUPPORT_TRANSFERABLE){
			transferableMessage(constraintreport.buffer, [constraintreport.buffer]);
		} else {
			transferableMessage(constraintreport);
		}
	}
};

self.onmessage = function(event){
	if(event.data instanceof Float32Array){
		switch(event.data[0]){
			case MESSAGE_TYPES.WORLDREPORT:
				worldreport = new Float32Array(event.data);
			break;
			case MESSAGE_TYPES.COLLISIONREPORT:
				collisionreport = new Float32Array(event.data);
			break;
			case MESSAGE_TYPES.VEHICLEREPORT:
				vehiclereport = new Float32Array(event.data);
			break;
			case MESSAGE_TYPES.CONSTRAINTREPORT:
				constraintreport = new Float32Array(event.data);
			break;
		}
		return;
	}

	if(event.data.cmd && public_functions[event.data.cmd]){
		public_functions[event.data.cmd](event.data.params);
	}
};
