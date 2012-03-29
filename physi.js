'use strict';

var Physijs = (function() {
	var _matrix = new THREE.Matrix4, _is_simulating = false,
		Physijs = {}, Eventable, getObjectId, getEulerXYZFromQuaternion,
		
		// constants
		MESSAGE_TYPES = {
			WORLDREPORT: 0,
			COLLISIONREPORT: 1
		},
		REPORT_ITEMSIZE = 14;
	
	Physijs.scripts = {};
	
	Eventable = function() {
		this._eventListeners = {};
	};
	Eventable.prototype.addEventListener = function( event_name, callback ) {
		if ( !this._eventListeners.hasOwnProperty( event_name ) ) {
			this._eventListeners[event_name] = [];
		}
		this._eventListeners[event_name].push( callback );
	};
	Eventable.prototype.removeEventListener = function( event_name, callback ) {
		var index;
		
		if ( !this._eventListeners.hasOwnProperty( event_name ) ) return false;
		
		if ( (index = this._eventListeners[event_name].indexOf( callback )) >= 0 ) {
			this._eventListeners[event_name].splice( index, 1 );
			return true;
		}
		
		return false;
	};
	Eventable.prototype.dispatchEvent = function( event_name ) {
		var i,
			parameters = Array.prototype.splice.call( arguments, 1 );
		
		if ( this._eventListeners.hasOwnProperty( event_name ) ) {
			for ( i = 0; i < this._eventListeners[event_name].length; i++ ) {
				this._eventListeners[event_name][i].apply( this, parameters );
			}
		}
	};
	Eventable.make = function( obj ) {
		obj.prototype.addEventListener = Eventable.prototype.addEventListener;
		obj.prototype.removeEventListener = Eventable.prototype.removeEventListener;
		obj.prototype.dispatchEvent = Eventable.prototype.dispatchEvent;
	};
	
	getEulerXYZFromQuaternion = function ( x, y, z, w ) {
		return new THREE.Vector3(
			Math.atan2( 2 * ( x * w - y * z ), ( w * w - x * x - y * y + z * z ) ),
			Math.asin( 2 *  ( x * z + y * w ) ),
			Math.atan2( 2 * ( z * w - x * y ), ( w * w + x * x - y * y - z * z ) )
		);
	};
	
	
	getObjectId = (function() {
		var _id = 0;
		return function() {
			return _id++;
		};
	})();
	
	
	// Physijs.Scene
	Physijs.Scene = function( params ) {
		var self = this;
		
		Eventable.call( this );
		THREE.Scene.call( this );
		
		this._worker = new Worker( Physijs.scripts.worker || 'physijs_worker.js' );
		this._objects = [];
		
		this._worker.onmessage = function ( event ) {
			var i, index, obj_id, obj, sceneObj, collisionObj, collided_with = [],
				update_details = {
					collisions: []
				};
			
			if ( event.data instanceof Float32Array ) {
				
				// transferable object
				switch ( event.data[0] ) {
					case MESSAGE_TYPES.WORLDREPORT:
						self._updateScene( event.data );
						break;
					
					case MESSAGE_TYPES.COLLISIONREPORT:
						self._updateCollisions( event.data );
						break;
				}
				
			} else {
				
				// non-transferable object
				switch ( event.data.cmd ) {
					default:
					// Do nothing, just show the message
					console.debug('Received: ' + event.data.cmd);
					console.dir(event.data.params);
					break;
				}
				
			}
		};
		
		
		params = params || {};
		params.ammo = Physijs.scripts.ammo || 'ammo.js';
		this.execute( 'init', params );
	};
	Physijs.Scene.prototype = new THREE.Scene;
	Physijs.Scene.prototype.constructor = Physijs.Scene;
	Eventable.make( Physijs.Scene );
	
	Physijs.Scene.prototype._updateScene = function( data ) {
		var num_objects = data[1],
			object,
			i, offset;
			
		for ( i = 0; i < num_objects; i++ ) {
			
			offset = 2 + i * REPORT_ITEMSIZE;
			object = this._objects[ data[ offset ] ];
			
			object.position.set(
				data[ offset + 1 ],
				data[ offset + 2 ],
				data[ offset + 3 ]
			);
			
			if ( object.useQuaternion ) {
				object.quaternion.set(
					data[ offset + 4 ],
					data[ offset + 5 ],
					data[ offset + 6 ],
					data[ offset + 7 ]
				);
			} else {
				object.rotation = getEulerXYZFromQuaternion(
					data[ offset + 4 ],
					data[ offset + 5 ],
					data[ offset + 6 ],
					data[ offset + 7 ]
				);
			};
			
			object._physijs.linearVelocity.set(
				data[ offset + 8 ],
				data[ offset + 9 ],
				data[ offset + 10 ]
			);
			
			object._physijs.angularVelocity.set(
				data[ offset + 11 ],
				data[ offset + 12 ],
				data[ offset + 13 ]
			);
			
		}
		
		if ( this._worker.webkitPostMessage ) {
			// Give the typed array back to the worker
			this._worker.webkitPostMessage( data, [data.buffer] );
		}
		
		_is_simulating = false;
		this.dispatchEvent( 'update' );
	};
	
	Physijs.Scene.prototype._updateCollisions = function( data ) {
		/**
		 * #TODO
		 * This is probably the worst way ever to handle collisions. The inherent evilness is a residual
		 * effect from the previous version's evilness which mutated when switching to transferable objects.
		 *
		 * If you feel inclined to make this better, please do so.
		 */
		 
		var i, j, offset, object, object2,
			collisions = {}, collided_with = [];
		
		// Build collision manifest
		for ( i = 0; i < data[1]; i++ ) {
			offset = 2 + i * 2;
			object = data[ offset ];
			object2 = data[ offset + 1 ];
			
			if ( !collisions[ object ] ) collisions[ object ] = [];
			collisions[ object ].push( object2 );
		}
		
		// Deal with collisions
		for ( i = 0; i < this._objects.length; i++ ) {
			object = this._objects[i];
			
			if ( collisions[ object._physijs.id ] ) {
				
				// this object is touching others
				collided_with.length = 0;
				
				for ( j = 0; j < collisions[ object._physijs.id ].length; j++ ) {
					object2 = this._objects[ collisions[ object._physijs.id ][j] ];
					
					if ( object._physijs.touches.indexOf( object2._physijs.id ) === -1 ) {
						object._physijs.touches.push( object2._physijs.id );
						
						object.dispatchEvent( 'collision', object2 );
						object2.dispatchEvent( 'collision', object );
					}
					
					collided_with.push( object2._physijs.id );
				}
				for ( j = 0; j < object._physijs.touches.length; j++ ) {
					if ( collided_with.indexOf( object._physijs.touches[j] ) === -1 ) {
						object._physijs.touches.splice( j--, 1 );
					}
				}
				
			} else {
				
				// not touching other objects
				object._physijs.touches.length = 0;
				
			}
			
		}
		
		if ( this._worker.webkitPostMessage ) {
			// Give the typed array back to the worker
			this._worker.webkitPostMessage( data, [data.buffer] );
		}
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
			
			this.execute( 'addObject', object._physijs );
		}
	};
	
	Physijs.Scene.prototype.remove = function( object ) {
		THREE.Mesh.prototype.remove.call( this, object );
		
		if ( object._physijs ) {
			this.execute( 'removeObject', { id: object._physijs.id } );
		}
	};
	
	Physijs.Scene.prototype.setGravity = function( gravity ) {
		if ( gravity ) {
			this.execute( 'setGravity', gravity );
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
						_matrix.identity().setRotationFromEuler( object.rotation );
						object.quaternion.setFromRotationMatrix( _matrix );
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
		Eventable.call( this );
		THREE.Mesh.call( this, geometry, material );
		
		if ( !geometry.boundingBox ) {
			geometry.computeBoundingBox();
		}
		
		this._physijs = {
			type: null,
			id: getObjectId(),
			mass: mass || 0,
			touches: [],
			linearVelocity: new THREE.Vector3,
			angularVelocity: new THREE.Vector3
		};
		
		for ( index in params ) {
			if ( !params.hasOwnProperty( index ) ) continue;
			this._physijs[index] = params[index];
		}
	};
	Physijs.Mesh.prototype = new THREE.Mesh;
	Physijs.Mesh.prototype.constructor = Physijs.Mesh;
	Eventable.make( Physijs.Mesh );
	
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
	
	// Physijs.Mesh.applyImpulse
	Physijs.Mesh.prototype.applyImpulse = function ( force, offset ) {
		if ( this.world ) {
			this.world.execute( 'applyImpulse', { id: this._physijs.id, impulse_x: force.x, impulse_y: force.y, impulse_z: force.z, x: offset.x, y: offset.y, z: offset.z } );
		}
	};
	
	// Physijs.Mesh.getAngularVelocity
	Physijs.Mesh.prototype.getAngularVelocity = function () {
		return this._physijs.angularVelocity;
	};
	
	// Physijs.Mesh.setAngularVelocity
	Physijs.Mesh.prototype.setAngularVelocity = function ( velocity ) {
		if ( this.world ) {
			this.world.execute( 'setAngularVelocity', { id: this._physijs.id, x: velocity.x, y: velocity.y, z: velocity.z } );
		}
	};
	
	// Physijs.Mesh.getLinearVelocity
	Physijs.Mesh.prototype.getLinearVelocity = function () {
		return this._physijs.linearVelocity;
	};
	
	// Physijs.Mesh.setLinearVelocity
	Physijs.Mesh.prototype.setLinearVelocity = function ( velocity ) {
		if ( this.world ) {
			this.world.execute( 'setLinearVelocity', { id: this._physijs.id, x: velocity.x, y: velocity.y, z: velocity.z } );
		}
	};
	
	// Physijs.Mesh.setAngularFactor
	Physijs.Mesh.prototype.setAngularFactor = function ( factor ) {
		if ( this.world ) {
			this.world.execute( 'setAngularFactor', { id: this._physijs.id, x: factor.x, y: factor.y, z: factor.z } );
		}
	};
	
	// Physijs.Mesh.setLinearFactor
	Physijs.Mesh.prototype.setLinearFactor = function ( factor ) {
		if ( this.world ) {
			this.world.execute( 'setLinearFactor', { id: this._physijs.id, x: factor.x, y: factor.y, z: factor.z } );
		}
	};
	
	// Physijs.Mesh.setCcdMotionThreshold
	Physijs.Mesh.prototype.setCcdMotionThreshold = function ( threshold ) {
		if ( this.world ) {
			this.world.execute( 'setCcdMotionThreshold', { id: this._physijs.id, threshold: threshold } );
		}
	};
	
	// Physijs.Mesh.setCcdSweptSphereRadius
	Physijs.Mesh.prototype.setCcdSweptSphereRadius = function ( radius ) {
		if ( this.world ) {
			this.world.execute( 'setLinearFactor', { id: this._physijs.id, radius: radius } );
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
	
	
	// Physijs.ConeMesh
	Physijs.ConeMesh = function( geometry, material, mass, params ) {
		var width, height, depth;
		
		Physijs.Mesh.call( this, geometry, material, mass, params );
		
		params = params || {};
		
		if ( !geometry.boundingBox ) {
			geometry.computeBoundingBox();
		}
		
		width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
		height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
		
		this._physijs.type = 'cone';
		this._physijs.radius = width / 2;
		this._physijs.height = height;
		this._physijs.mass = (typeof mass === 'undefined') ? width * height : mass;
	};
	Physijs.ConeMesh.prototype = new Physijs.Mesh;
	Physijs.ConeMesh.prototype.constructor = Physijs.ConeMesh;
	
	// Physijs.CustomMesh
	Physijs.CustomMesh = function( geometry, material, mass, params ) {
		var i,
			width, height, depth,
			triangles = [];
		
		Physijs.Mesh.call( this, geometry, material, mass, params );
		
		params = params || {};
		
		if ( !geometry.boundingBox ) {
			geometry.computeBoundingBox();
		}
		
		for ( i = 0; i < geometry.faces.length; i++ ) {
			if ( geometry.faces[i] instanceof THREE.Face3 ) {
				triangles.push([
					[ geometry.vertices[ geometry.faces[i].a ].position.x, geometry.vertices[ geometry.faces[i].a ].position.y, geometry.vertices[ geometry.faces[i].a ].position.z ],
					[ geometry.vertices[ geometry.faces[i].b ].position.x, geometry.vertices[ geometry.faces[i].b ].position.y, geometry.vertices[ geometry.faces[i].b ].position.z ],
					[ geometry.vertices[ geometry.faces[i].c ].position.x, geometry.vertices[ geometry.faces[i].c ].position.y, geometry.vertices[ geometry.faces[i].c ].position.z ]
				]);
			} else {
				triangles.push([
					[ geometry.vertices[ geometry.faces[i].a ].position.x, geometry.vertices[ geometry.faces[i].a ].position.y, geometry.vertices[ geometry.faces[i].a ].position.z ],
					[ geometry.vertices[ geometry.faces[i].b ].position.x, geometry.vertices[ geometry.faces[i].b ].position.y, geometry.vertices[ geometry.faces[i].b ].position.z ],
					[ geometry.vertices[ geometry.faces[i].d ].position.x, geometry.vertices[ geometry.faces[i].d ].position.y, geometry.vertices[ geometry.faces[i].d ].position.z ]
				]);
				triangles.push([
					[ geometry.vertices[ geometry.faces[i].b ].position.x, geometry.vertices[ geometry.faces[i].b ].position.y, geometry.vertices[ geometry.faces[i].b ].position.z ],
					[ geometry.vertices[ geometry.faces[i].c ].position.x, geometry.vertices[ geometry.faces[i].c ].position.y, geometry.vertices[ geometry.faces[i].c ].position.z ],
					[ geometry.vertices[ geometry.faces[i].d ].position.x, geometry.vertices[ geometry.faces[i].d ].position.y, geometry.vertices[ geometry.faces[i].d ].position.z ]
				]);
			}
		}
		
		
		width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
		height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
		depth = geometry.boundingBox.max.z - geometry.boundingBox.min.z;
		
		this._physijs.type = 'custom';
		this._physijs.triangles = triangles;
		this._physijs.mass = (typeof mass === 'undefined') ? width * height * depth : mass;
	};
	Physijs.CustomMesh.prototype = new Physijs.Mesh;
	Physijs.CustomMesh.prototype.constructor = Physijs.CustomMesh;
	
	
	// Physijs.HeightfieldMesh
	Physijs.HeightfieldMesh = function( geometry, material, mass, params ) {
		var i, j, vertex,
			width, length, heightfield = [], maxheight = 0;
		
		Physijs.Mesh.call( this, geometry, material, mass, params );
		
		params = params || {};
		
		if ( !geometry.boundingBox ) {
			geometry.computeBoundingBox();
		}
		
		width = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
		length = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
		
		for ( i = 0; i < params.width; i++ ) {
			for ( j = 0; j < params.length; j++ ) {
				vertex = geometry.vertices[ i + j * (params.length) ];
				heightfield.push([
					vertex.position.x,
					vertex.position.z,
					vertex.position.y
				]);
				
				if ( Math.abs( vertex.position.z ) > maxheight ) {
					maxheight = Math.abs( vertex.position.z );
				}
			}
		}
		
		this._physijs.type = 'heightfield';
		this._physijs.width = width;
		this._physijs.length = length;
		this._physijs.datapoints_x = params.width;
		this._physijs.datapoints_y = params.length;
		this._physijs.mass = (typeof mass === 'undefined') ? width * height * length : mass;
		this._physijs.heightfield = heightfield;
		this._physijs.maxheight = maxheight;
	};
	Physijs.HeightfieldMesh.prototype = new Physijs.Mesh;
	Physijs.HeightfieldMesh.prototype.constructor = Physijs.CylinderMesh;
	
	
	return Physijs;
})();