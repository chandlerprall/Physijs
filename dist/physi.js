(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	global.physijs = factory();
}(this, function () { 'use strict';

	function Scene( worker_script_location, world_config ) {
		THREE.Scene.call( this );
		this.initializeWorker( worker_script_location, world_config );
	}

	Scene.prototype = Object.create( THREE.Scene.prototype );
	Scene.prototype.constructor = Scene;

	var MESSAGE_TYPES = {
		/**
		 * initializes the physics world
		 * [broadphase] String either 'sap' or 'naive' [default 'sap']
		 * [gravity] Object with float properties `x`, `y`, `z` [default {x:0, y:-9.8, z:0} ]
		 */
		INITIALIZE: 'INITIALIZE',

		/**
		 * adds a rigid body to the world
		 * body_id Integer unique integer id for the body
		 * body_type String a constant found in `BODY_TYPES`
		 * body_description Object definition corresponding to the type of rigid body (see BODY_TYPES)
		 * mass Float amount of mass the body has, 0 or Infinity creates a static object
		 */
		ADD_RIGIDBODY: 'ADD_RIGIDBODY',

		/**
		 * sets the specified rigid body's mass
		 * body_id Integer unique integer id for the body
		 * mass Float new mass value
		 */
		SET_RIGIDBODY_MASS: 'SET_RIGIDBODY_MASS'
	};

	Scene.prototype.initializeWorker = function( worker_script_location, world_config ) {
		this.worker = new Worker( worker_script_location );
		this.worker.addEventListener(
			'message',
			function() {
				console.log('scene got message with', arguments);
			}
		);
		this.postMessage( MESSAGE_TYPES.INITIALIZE, world_config || {} );
	};

	Scene.prototype.postMessage = function( type, parameters ) {
		this.worker.postMessage({
			type: type,
			parameters: parameters
		});
	};

	var BODY_TYPES = {
		/**
		 * radius Float radius of the sphere
		 */
		SPHERE: 'SPHERE'
	}

	var nextId = 0;
	function getUniqueId() {
		return nextId++;
	}

	function Mesh( geometry, material, mass ) {
		if ( mass == null ) {
			throw new Error( 'Physijs: attempted to create rigid body without specifying mass' );
		}

		THREE.Mesh.call( this, geometry, material );
		this.physijs_id = getUniqueId();
		this._mass = mass || Infinity;
	}

	Mesh.prototype = Object.create( THREE.Mesh.prototype );
	Mesh.prototype.constructor = Mesh;

	Object.defineProperty(
		Mesh.prototype,
		'mass',
		{
			get: function() {
				return this._mass;
			},
			set: function( mass ) {
				this._mass = mass;
				if ( this.parent != null ) {
					this.parent.setRigidBodyMass( this, mass );
				}
			}
		}
	);

	function SphereMesh( geometry, material, mass ) {
		Mesh.call( this, geometry, material, mass );
	}

	SphereMesh.prototype = Object.create( Mesh.prototype );
	SphereMesh.prototype.constructor = SphereMesh;

	function getRigidBodyDefinition( mesh ) {
		var body_type;
		var body_definition = {};

		if ( mesh instanceof SphereMesh ) {
			mesh.geometry.computeBoundingSphere(); // make sure bounding radius has been calculated
			body_type = BODY_TYPES.SPHERE;
			body_definition.radius = mesh.geometry.boundingSphere.radius;
		} else {
			throw new Error( 'Physijs: unable to determine rigid body definition for mesh' );
		}

		return {
			body_id: mesh.physijs_id,
			body_type: body_type,
			body_definition: body_definition,
			mass: mesh.mass
		};
	}

	Scene.prototype.add = function( object ) {
		THREE.Scene.prototype.add.call( this, object );

		if ( object instanceof Mesh ) {
			this.postMessage(
				MESSAGE_TYPES.ADD_RIGIDBODY, getRigidBodyDefinition( object )
			);
		}
	};

	Scene.prototype.setRigidBodyMass = function( mesh, mass ) {
		this.postMessage(
			MESSAGE_TYPES.SET_RIGIDBODY_MASS,
			{
				body_id: mesh.physijs_id,
				mass: mass
			}
		);
	};

	var index = {
		Mesh: Mesh,
		SphereMesh: SphereMesh,

		Scene: Scene
	};

	return index;

}));