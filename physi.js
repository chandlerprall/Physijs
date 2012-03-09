'use strict';

var Physijs = (function() {
	var _matrix = new THREE.Matrix4, _is_simulating = false,
		Physijs = {}, getObjectId, getEulerXYZFromQuaternion;
	
	Physijs.scripts = {};
	
	getEulerXYZFromQuaternion = function ( x, y, z, w ) {
		return new THREE.Vector3(
			Math.atan2( 2 * ( x * w - y * z ), ( w * w - x * x - y * y + z * z ) ),
			Math.asin( 2 *  ( x * z + y * w ) ),
			Math.atan2( 2 * ( z * w - x * y ), ( w * w + x * x - y * y - z * z ) )
		);
	};
	
	THREE.Quaternion.prototype.setFromEuler = function( vec3 ) {
		var pitch = vec3.x,
			yaw = vec3.y,
			roll = vec3.z;
		
		var halfYaw = yaw * 0.5;
		var halfPitch = pitch * 0.5;
		var halfRoll = roll * 0.5;
		var cosYaw = Math.cos(halfYaw);
		var sinYaw = Math.sin(halfYaw);
		var cosPitch = Math.cos(halfPitch);
		var sinPitch = Math.sin(halfPitch);
		var cosRoll = Math.cos(halfRoll);
		var sinRoll = Math.sin(halfRoll);
		
		this.x = cosRoll * sinPitch * cosYaw + sinRoll * cosPitch * sinYaw;
		this.y = cosRoll * cosPitch * sinYaw - sinRoll * sinPitch * cosYaw;
		this.z = sinRoll * cosPitch * cosYaw - cosRoll * sinPitch * sinYaw;
		this.w = cosRoll * cosPitch * cosYaw + sinRoll * sinPitch * sinYaw;
	};
	
	getObjectId = (function() {
		var _id = 0;
		return function() {
			return _id++;
		};
	})();
	
	
	// Physijs.Scene
	Physijs.Scene = function() {
		var self = this;
		
		THREE.Scene.call( this );
		
		this._worker = new Worker( Physijs.scripts.worker || 'physijs_worker.js' );
		this._objects = [];
		
		this._worker.onmessage = function ( event ) {
			var i, obj, sceneObj;
			
			switch ( event.data.cmd ) {
				
				case 'update':
					for ( i = 0; i < event.data.params.objects.length; i++ ) {
						obj = event.data.params.objects[i];
						//sceneObj = self.getByPhysijsId( obj.id );
						sceneObj = self._objects[obj.id];
						
						sceneObj.position.set( obj.pos_x, obj.pos_y, obj.pos_z );
						if ( sceneObj.useQuaternion) {
							sceneObj.quaternion.set( obj.quat_x, obj.quat_y, obj.quat_z, obj.quat_w );
						} else {
							sceneObj.rotation = getEulerXYZFromQuaternion( obj.quat_x, obj.quat_y, obj.quat_z, obj.quat_w );
						};
					}
					
					_is_simulating = false;
					break;
				
				default:
					// Do nothing
					console.debug('Received: ' + event.data.cmd);
					console.dir(event.data.params);
					break;
			}
			
		};
		
		this.execute( 'init', { ammo: Physijs.scripts.ammo || 'ammo.js' } );
	};
	Physijs.Scene.prototype = new THREE.Scene;
	Physijs.Scene.prototype.constructor = Physijs.Scene;
	
	Physijs.Scene.prototype.getByPhysijsId = function getByPhysijsId( id ) {
		var i, child, found_in_children;
		
		for ( i = 0; i < this.children.length; i++ ) {
			child = this.children[i];
			if ( child._physijs && child._physijs.id === id ) {
				return child;
			}
			
			if ( found_in_children = getByPhysijsId.call( child, id ) ) {
				return found_in_children;
			}
		}
		
		return undefined;
	};
	
	Physijs.Scene.prototype.execute = function( cmd, params ) {
		this._worker.postMessage({ cmd: cmd, params: params });
	};
	
	Physijs.Scene.prototype.add = function( object ) {
		THREE.Mesh.prototype.add.call( this, object );
		
		if ( object._physijs ) {
			
			object.__dirtyPosition = true;
			object.__dirtyRotation = true;
			this._objects[object._physijs.id] = object;
			
			object.world = this;
			
			this.execute( 'addObject', { description: object._physijs } );
		};
	};
	
	Physijs.Scene.prototype.setGravity = function( gravity ) {
		if ( gravity ) {
			this.execute( 'setGravity', { gravity: gravity } );
		}
	};
	
	Physijs.Scene.prototype.simulate = function( timeStep, maxSubSteps ) {
		var object_id, object, update;
		
		if ( _is_simulating ) {
			return false;
		}
		
		_is_simulating = true;
		
		for ( object_id in this._objects ) {
			if ( !this._objects.hasOwnProperty( object_id ) ) continue;
			
			object = this._objects[object_id];
			
			if ( object.__dirtyPosition || object.__dirtyRotation ) {
				update = { id: object._physijs.id };
				
				if ( object.__dirtyPosition ) {
					update.pos = { x: object.position.x, y: object.position.y, z: object.position.z };
					object.__dirtyPosition = false;
				}
				
				if ( object.__dirtyRotation ) {
					if (!object.useQuaternion) {
						//_matrix.identity().setRotationFromEuler( object.rotation );
						//object.quaternion.setFromRotationMatrix( _matrix );
						object.quaternion.setFromEuler( object.rotation ); //TODO: fix setFromEuler
					};
					update.quat = { x: object.quaternion.x, y: object.quaternion.y, z: object.quaternion.z, w: object.quaternion.w };
					object.__dirtyRotation = false;
				}
				
				this.execute( 'updateTransform', update );
			};
		}
		
		this.execute( 'simulate', { timeStep: timeStep, maxSubSteps: maxSubSteps } );
		
		return true;
	};
	
	
	// Phsijs.Mesh
	Physijs.Mesh = function ( geometry, material, mass, params ) {
		var index;
		
		if ( !geometry ) {
			return;
		}
		
		params = params || {};
		
		THREE.Mesh.call( this, geometry, material );
		
		if ( !geometry.boundingBox ) {
			geometry.computeBoundingBox();
		}
		
		this._physijs = {
			type: null,
			id: getObjectId(),
			mass: mass || 0
		}
		
		for ( index in params ) {
			if ( !params.hasOwnProperty( index ) ) continue;
			this._physijs[index] = params[index];
		}
		
	};
	Physijs.Mesh.prototype = new THREE.Mesh;
	Physijs.Mesh.prototype.constructor = Physijs.Mesh;
	
	// Physijs.Mesh.mass
	Physijs.Mesh.prototype.__defineGetter__('mass', function() {
		return this._physijs.mass;
	});
	Physijs.Mesh.prototype.__defineSetter__('mass', function( mass ) {
		this._physijs.mass = mass;
		if ( this.world ) {
			this.world.execute( 'updateMass', { id: this._physijs.id, mass: mass } );
		}
	});
	
	// Physijs.Mesh.applyCentralImpulse
	Physijs.Mesh.prototype.applyCentralImpulse = function ( force ) {
		if ( this.world ) {
			this.world.execute( 'applyCentralImpulse', { id: this._physijs.id, x: force.x, y: force.y, z: force.z } );
		}
	};
	
	
	// Physijs.PlaneMesh
	Physijs.PlaneMesh = function ( geometry, material, mass, params ) {
		var width, height;
		
		Physijs.Mesh.call( this, geometry, material, mass, params );
		
		params = params || {};
		
		width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
		height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
		
		this._physijs.type = 'plane';
		
		this._physijs.normal = geometry.faces[0].normal.clone();
		this._physijs.normal = {
			x: this._physijs.normal.x,
			y: this._physijs.normal.y,
			z: this._physijs.normal.z
		};
		this._physijs.mass = (typeof mass === 'undefined') ? width * height : mass;
		
		//console.debug(this._physijs.normal);
		//throw 'done';
	};
	Physijs.PlaneMesh.prototype = new Physijs.Mesh;
	Physijs.PlaneMesh.prototype.constructor = Physijs.PlaneMesh;
	
	
	// Physijs.BoxMesh
	Physijs.BoxMesh = function( geometry, material, mass, params ) {
		var width, height, depth;
		
		Physijs.Mesh.call( this, geometry, material, mass, params );
		
		params = params || {};
		
		if ( !geometry.boundingBox ) {
			geometry.computeBoundingBox();
		}
		
		width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
		height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
		depth = geometry.boundingBox.max.z - geometry.boundingBox.min.z;
		
		this._physijs.type = 'box';
		this._physijs.width = width;
		this._physijs.height = height;
		this._physijs.depth = depth;
		this._physijs.mass = (typeof mass === 'undefined') ? width * height * depth : mass;
	};
	Physijs.BoxMesh.prototype = new Physijs.Mesh;
	Physijs.BoxMesh.prototype.constructor = Physijs.BoxMesh;
	
	
	// Physijs.SphereMesh
	Physijs.SphereMesh = function( geometry, material, mass, params ) {
		Physijs.Mesh.call( this, geometry, material, mass, params );
		
		params = params || {};
		
		if ( !geometry.boundingSphere ) {
			geometry.computeBoundingSphere();
		}
		
		this._physijs.type = 'sphere';
		this._physijs.radius = geometry.boundingSphere.radius;
		this._physijs.mass = (typeof mass === 'undefined') ? (4/3) * Math.PI * Math.pow(this._physijs.radius, 3) : mass;
	};
	Physijs.SphereMesh.prototype = new Physijs.Mesh;
	Physijs.SphereMesh.prototype.constructor = Physijs.SphereMesh;
	
	
	// Physijs.CylinderMesh
	Physijs.CylinderMesh = function( geometry, material, mass, params ) {
		var width, height, depth;
		
		Physijs.Mesh.call( this, geometry, material, mass, params );
		
		params = params || {};
		
		if ( !geometry.boundingBox ) {
			geometry.computeBoundingBox();
		}
		
		width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
		height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
		depth = geometry.boundingBox.max.z - geometry.boundingBox.min.z;
		
		this._physijs.type = 'cylinder';
		this._physijs.width = width;
		this._physijs.height = height;
		this._physijs.depth = depth;
		this._physijs.mass = (typeof mass === 'undefined') ? width * height * depth : mass;
	};
	Physijs.CylinderMesh.prototype = new Physijs.Mesh;
	Physijs.CylinderMesh.prototype.constructor = Physijs.CylinderMesh;
	
	
	return Physijs;
})();