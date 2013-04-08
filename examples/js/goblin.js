/**
 * Extensions to gl-matrix quat4
 */
(function() {
	var _quat = quat4.create(),
		_vec = vec3.create();

	/**
	 * @method rotateByVector
	 * @param quat {quat4} quat4 to rotate
	 * @param vec {vec3} vec3 to rotate quat4 by
	 * @param [dest] {quat4} quat4 receiving the rotated values. If not specified result is written to quat.
	 */
	quat4.rotateByVector = function( quat, vec, dest ) {
		if (!dest) { dest = quat; }

		_quat[0] = vec[0];
		_quat[1] = vec[1];
		_quat[2] = vec[2];
		_quat[3] = 0;

		quat4.multiply( quat, _quat, dest );

		return dest;
	};

	/**
	 * @method addScaledVector
	 * @param quat {quat4} quat4 to add rotation to
	 * @param vec {vec3} vec3 to rotate quat4 by
	 * @param scale {Number} amount to scale `vec` by
	 * @param [dest] {quat4} quat4 receiving the rotated values. If not specified result is written to quat.
	 */
	quat4.addScaledVector = function( quat, vec, scale, dest ) {
		if (!dest) { dest = quat; }

		var c1 = Math.cos( vec[0] * scale / 2 );
			c2 = Math.cos( vec[1] * scale / 2 ),
			c3 = Math.cos( vec[2] * scale / 2 ),
			s1 = Math.sin( vec[0] * scale / 2 ),
			s2 = Math.sin( vec[1] * scale / 2 ),
			s3 = Math.sin( vec[2] * scale / 2 );

		_quat[0] = s1 * c2 * c3 + c1 * s2 * s3;
		_quat[1] = c1 * s2 * c3 - s1 * c2 * s3;
		_quat[2] = c1 * c2 * s3 + s1 * s2 * c3;
		_quat[3] = c1 * c2 * c3 - s1 * s2 * s3;

		quat4.multiply( quat, _quat );

		/*vec3.scale( vec, scale, _vec );
		vec3.scale( _vec, 0.5 );

		var thetaMagSq = vec3.squaredLength( _vec ),
			thetaMag,
			s;

		if ( thetaMagSq * thetaMagSq / 24 < Goblin.EPSILON ) {
			_quat[3] = 1 - thetaMagSq / 2;
			s = 1 - thetaMagSq / 6;
		} else {
			thetaMag = Math.sqrt( thetaMagSq );
			_quat[3] = Math.cos( thetaMag );
			s = Math.sin( thetaMag ) / thetaMag;
		}

		_quat[0] = _vec[0] * s;
		_quat[1] = _vec[1] * s;
		_quat[2] = _vec[2] * s;

		quat4.multiply( _quat, quat, dest );*/

		return dest;
	}
})();

/**
* Goblin physics module
*
* @module Goblin
*/
Goblin = (function() {
	'use strict';

	var Goblin = {},
		_tmp_vec3_1 = vec3.create(),
		_tmp_vec3_2 = vec3.create(),
		_tmp_vec3_3 = vec3.create(),

		_tmp_quat4_1 = quat4.create(),

		_tmp_mat3_1 = mat3.create(),
		_tmp_mat3_2 = mat3.create();

    Goblin.EPSILON = 0.000001;
/**
 * Performs a n^2 check of all collision objects to see if any could be in contact
 *
 * @class BasicBroadphase
 * @constructor
 */
Goblin.BasicBroadphase = function() {
	/**
	 * Holds all of the collision objects that the broadphase is responsible for
	 *
	 * @property bodies
	 * @type {Array}
	 */
	this.bodies = [];

	/**
	 * Array of all (current) collision pairs between the broadphase's bodies
	 *
	 * @property collision_pairs
	 * @type {Array}
	 */
	this.collision_pairs = [];
};

/**
 * Adds a body to the broadphase for contact checking
 *
 * @method addBody
 * @param body {MassPoint|RigidBody} body to add to the broadphase contact checking
 */
Goblin.BasicBroadphase.prototype.addBody = function( body ) {
	this.bodies.push( body );
};

/**
 * Removes a body from the broadphase contact checking
 *
 * @method removeBody
 * @param body {MassPoint|RigidBody} body to remove from the broadphase contact checking
 */
Goblin.BasicBroadphase.prototype.removeBody = function( body ) {
	var i,
		body_count = this.bodies.length;

	for ( i = 0; i < body_count; i++ ) {
		if ( this.bodies[i] === body ) {
			this.bodies.splice( i, 1 );
			break;
		}
	}
};

/**
 * Checks all collision objects to find any which are possibly in contact
 *  resulting contact pairs are held in the object's `collision_pairs` property
 *
 * @method predictContactPairs
 */
Goblin.BasicBroadphase.prototype.predictContactPairs = function() {
	var _vec3 = _tmp_vec3_1,
		i, j,
		object_a, object_b,
		distance,
		bodies_count = this.bodies.length;

	// Clear any old contact pairs
	this.collision_pairs.length = 0;

	// Loop over all collision objects and check for overlapping boundary spheres
	for ( i = 0; i < bodies_count; i++ ) {
		object_a = this.bodies[i];

		for ( j = 0; j < bodies_count; j++ ) {
			if ( i <= j ) {
				// if i < j then we have already performed this check
				// if i === j then the two objects are the same and can't be in contact
				continue;
			}

			object_b = this.bodies[j];

			vec3.subtract( object_a.position, object_b.position, _vec3 );
			distance = vec3.length( _vec3 ) - object_a.bounding_radius - object_b.bounding_radius;

			if ( distance <= 0 ) {
				// We have a possible contact
				this.collision_pairs.push([ object_a, object_b ]);
			}
		}
	}
};
Goblin.BoxSphere = function( object_a, object_b ) {
	var sphere = object_a.shape instanceof Goblin.SphereShape ? object_a : object_b,
		box = object_a.shape instanceof Goblin.SphereShape ? object_b : object_a,
		contact;

	// Transform the center of the sphere into box coordinates
	mat4.multiplyVec3( object_b.transform_inverse, sphere.position, _tmp_vec3_1 );

	// Early out check to see if we can exclude the contact
	if ( Math.abs( _tmp_vec3_1[0] ) - sphere.bounding_radius > box.shape.half_width ||
		Math.abs( _tmp_vec3_1[1] ) - sphere.bounding_radius > box.shape.half_height ||
		Math.abs( _tmp_vec3_1[2] ) - sphere.bounding_radius > box.shape.half_depth )
	{
		return;
	}

	// `_tmp_vec3_2` will hold the closest point of the box to the sphere
	_tmp_vec3_2[0] = _tmp_vec3_2[1] = _tmp_vec3_2[2] = 0;

	// Clamp each coordinate to the box.
	var distance = _tmp_vec3_1[0];
	if (distance > box.shape.half_width) {
		distance = box.shape.half_width;
	} else if (distance < -box.shape.half_width) {
		distance = -box.shape.half_width;
	}
	_tmp_vec3_2[0] = distance;

	distance = _tmp_vec3_1[1];
	if (distance > box.shape.half_height) {
		distance = box.shape.half_height;
	} else if (distance < -box.shape.half_height) {
		distance = -box.shape.half_height;
	}
	_tmp_vec3_2[1] = distance;

	distance = _tmp_vec3_1[2];
	if (distance > box.shape.half_depth) {
		distance = box.shape.half_depth;
	} else if (distance < -box.shape.half_depth) {
		distance = -box.shape.half_depth;
	}
	_tmp_vec3_2[2] = distance;

	// Check we're in contact
	vec3.subtract( _tmp_vec3_2, _tmp_vec3_1, _tmp_vec3_3 );
	distance = vec3.squaredLength( _tmp_vec3_3 );
	if (distance > sphere.bounding_radius * sphere.bounding_radius ) {
		return;
	}

	// Get a ContactDetails object and fill out it's information
	contact = Goblin.ObjectPool.getObject( 'ContactDetails' );
	contact.object_a = sphere;
	contact.object_b = box;

	// Set contact point of `object_b` (the box)
	vec3.set( _tmp_vec3_2, contact.contact_point_in_b );

	// Move the closest point back to world coordinates
	mat4.multiplyVec3( box.transform, _tmp_vec3_2 );

	// Contact normal is the line between the sphere's position and the closest point
	vec3.subtract( sphere.position, _tmp_vec3_2, _tmp_vec3_3 );
	vec3.normalize( _tmp_vec3_3, contact.contact_normal );
	vec3.scale( contact.contact_normal, -1 );

	// Calculate contact position
	vec3.set( _tmp_vec3_2, contact.contact_point );

	// Find contact points in the objects
	// Convert contact_point into both object's local frames
	mat4.multiplyVec3( contact.object_a.transform_inverse, _tmp_vec3_2, contact.contact_point_in_a );
	mat4.multiplyVec3( contact.object_b.transform_inverse, _tmp_vec3_2, contact.contact_point_in_b );

	// Calculate penetration depth
	contact.penetration_depth = sphere.bounding_radius - Math.sqrt( distance );

	contact.restitution = ( sphere.restitution + box.restitution ) / 2;
	contact.friction = ( sphere.friction + box.friction ) / 2;

	return contact;
};
/**
 * Provides the classes and algorithms for running GJK+EPA based collision detection
 *
 * @submodule GjkEpa
 * @static
 */
Goblin.GjkEpa = {
	/**
	 * Holds a point on the edge of a Minkowski difference along with that point's witnesses and the direction used to find the point
	 *
	 * @class SupportPoint
	 * @param direction {vec3} Direction searched to find the point
	 * @param witness_a {vec3} Point in first object used to find the supporting point
	 * @param witness_b {vec3} Point in the second object ued to find th supporting point
	 * @param point {vec3} The support point on the edge of the Minkowski difference
	 * @constructor
	 */
	SupportPoint: function( direction, witness_a, witness_b, point ) {
		this.direction = direction;
		this.witness_a = witness_a;
		this.witness_b = witness_b;
		this.point = point;
	},

	/**
	 * Finds the extant point on the edge of the Minkowski difference for `object_a` - `object_b` in `direction`
	 *
	 * @method findSupportPoint
	 * @param object_a {Goblin.RigidBody} First object in the search
	 * @param object_b {Goblin.RigidBody} Second object in the search
	 * @param direction {vec3} Direction to find the extant point in
	 * @param gjk_point {Goblin.GjkEpa.SupportPoint} `SupportPoint` class to store the resulting point & witnesses in
	 */
	findSupportPoint: function( object_a, object_b, direction, gjk_point ) {
		// @TODO possible optimization would be using gjk_point`s direction instead of passing in a `direction` vector
		vec3.set( direction, gjk_point.direction );

		object_a.findSupportPoint( direction, gjk_point.witness_a );
		vec3.negate( direction, _tmp_vec3_1 );
		object_b.findSupportPoint( _tmp_vec3_1, gjk_point.witness_b );

		vec3.subtract( gjk_point.witness_a, gjk_point.witness_b, gjk_point.point );
	},

	/**
	 * Performs the GJK algorithm to detect a collision between the two objects
	 *
	 * @method GJK
	 * @param object_a {Goblin.RigidBody} First object to check for a collision state
	 * @param object_b {Goblin.RigidBody} Second object to check for a collision state
	 * @return {Goblin.ContactDetails|Boolean} Returns `false` if no collision, else a `ContactDetails` object
	 */
	GJK: (function() {
		var simplex = [],
			direction = vec3.create(),
			support_point,

			total_checks = 0,
			max_checks = 20, // @TODO make this a configurable member on `GJK`

			ao = vec3.create(),
			ab = vec3.create(),
			ac = vec3.create(),
			ad = vec3.create(),
			abc = vec3.create(),
			ab_abc = vec3.create(),
			abc_ac = vec3.create(),

			origin = vec3.create(), // always equal to [0, 0, 0]
			contains_origin = true, // invalidated if the simplex does not contain origin

			_vec3_1 = _tmp_vec3_1,
			_vec3_2 = _tmp_vec3_2,
			_vec3_3 = _tmp_vec3_3,

			expandSimplex = function( simplex, direction ) {

				var a, b, c, d; // `a` - `d` are references to the [up to] four points in the GJK simplex

				if ( simplex.length === 2 ) {
					// Line
					a = simplex[ 1 ];
					b = simplex[ 0 ];
					vec3.negate( a.point, ao );
					vec3.subtract( b.point, a.point, ab );

					// If ao happens to be at origin then there is a collision
					if ( ao[0] === 0 && ao[1] === 0 && ao[2] === 0 ) {
						return true;
					}

					if ( vec3.dot( ab, ao ) >= 0 ) {
						// Origin lies between A and B, move on to a 2-simplex
						vec3.cross( ab, ao, direction );
						vec3.cross( direction, ab );

						// In the very rare case that `ab` and `ao` are parallel vectors, direction becomes a 0-vector
						if (
							direction[0] === 0 &&
							direction[1] === 0 &&
							direction[2] === 0
						) {
							vec3.normalize( ab );
							direction[0] = 1 - Math.abs( ab[0] );
							direction[1] = 1 - Math.abs( ab[1] );
							direction[2] = 1 - Math.abs( ab[2] );
						}
					} else {
						// Origin is on the opposite side of A from B
						vec3.set( ao, direction );
						simplex.length = 1;
					}

				} else if ( simplex.length === 3 ) {

					// Triangle
					a = simplex[ 2 ];
					b = simplex[ 1 ];
					c = simplex[ 0 ];

					vec3.negate( a.point, ao );
					vec3.subtract( b.point, a.point, ab );
					vec3.subtract( c.point, a.point, ac );

					// Determine the triangle's normal
					vec3.cross( ab, ac, abc );

					// Edge cross products
					vec3.cross( ab, abc, ab_abc );
					vec3.cross( abc, ac, abc_ac );

					if ( vec3.dot( abc_ac, ao ) >= 0 ) {
						// Origin lies on side of ac opposite the triangle
						if ( vec3.dot( ac, ao ) >= 0 ) {
							// Origin outside of the ac line, so we form a new
							// 1-simplex (line) with points A and C, leaving B behind
							simplex.length = 0;
							simplex.push( c, a );

							// New search direction is from ac towards the origin
							vec3.cross( ac, ao, direction );
							vec3.cross( direction, ac );
						} else {
							// *
							if ( vec3.dot( ab, ao ) >= 0 ) {
								// Origin outside of the ab line, so we form a new
								// 1-simplex (line) with points A and B, leaving C behind
								simplex.length = 0;
								simplex.push( b, a );

								// New search direction is from ac towards the origin
								vec3.cross( ab, ao, direction );
								vec3.cross( direction, ab );
							} else {
								// only A gives us a good reference point, start over with a 0-simplex
								simplex.length = 0;
								simplex.push( a );
							}
							// *
						}

					} else {

						// Origin lies on the triangle side of ac
						if ( vec3.dot( ab_abc, ao ) >= 0 ) {
							// Origin lies on side of ab opposite the triangle

							// *
							if ( vec3.dot( ab, ao ) >= 0 ) {
								// Origin outside of the ab line, so we form a new
								// 1-simplex (line) with points A and B, leaving C behind
								simplex.length = 0;
								simplex.push( b, a );

								// New search direction is from ac towards the origin
								vec3.cross( ab, ao, direction );
								vec3.cross( direction, ab );
							} else {
								// only A gives us a good reference point, start over with a 0-simplex
								simplex.length = 0;
								simplex.push( a );
							}
							// *

						} else {

							// Origin lies somewhere in the triangle or above/below it
							if ( vec3.dot( abc, ao ) >= 0 ) {
								// Origin is on the front side of the triangle
								vec3.set( abc, direction );
							} else {
								// Origin is on the back side of the triangle
								vec3.set( abc, direction );
								vec3.negate( direction );
								simplex.length = 0;
								simplex.push( a, b, c );
							}

						}

					}

				} else if ( simplex.length === 4 ) {

					// Tetrahedron
					a = simplex[ 3 ];
					b = simplex[ 2 ];
					c = simplex[ 1 ];
					d = simplex[ 0 ];

					vec3.negate( a.point, ao );

					// First check if the origin is contained in this tetrahedron
					// If any of the sides face the origin then it is not inside
					contains_origin = true;

					// Check DCA
					vec3.subtract( d.point, a.point, ab );
					vec3.subtract( c.point, a.point, ad );
					vec3.cross( ab, ad, abc_ac );
					if ( vec3.dot( abc_ac, a.point ) > 0 ) {
						contains_origin = false;
					}

					// Check CBA
					vec3.subtract( c.point, a.point, ab );
					vec3.subtract( b.point, a.point, ad );
					vec3.cross( ab, ad, abc_ac );
					if ( vec3.dot( abc_ac, a.point ) > 0 ) {
						contains_origin = false;
					}

					// Check ADB
					vec3.subtract( b.point, a.point, ab );
					vec3.subtract( d.point, a.point, ad );
					vec3.cross( ab, ad, abc_ac );
					if ( vec3.dot( abc_ac, a.point ) > 0 ) {
						contains_origin = false;
					}

					// Check DCB
					vec3.subtract( b.point, d.point, ab );
					vec3.subtract( c.point, d.point, ad );
					vec3.cross( ab, ad, abc_ac );
					if ( vec3.dot( abc_ac, d.point ) > 0 ) {
						contains_origin = false;
					}

					if ( contains_origin ) {
						return contains_origin;
					}


					/*var center_dca = vec3.create(),
						center_cba = vec3.create(),
						center_adb = vec3.create(),
						center_dcb = vec3.create();

					Goblin.GeometryMethods.findClosestPointInTriangle( origin, d.point, c.point, a.point, center_dca );
					Goblin.GeometryMethods.findClosestPointInTriangle( origin, c.point, b.point, a.point, center_cba );
					Goblin.GeometryMethods.findClosestPointInTriangle( origin, b.point, d.point, a.point, center_adb );
					Goblin.GeometryMethods.findClosestPointInTriangle( origin, d.point, b.point, c.point, center_dcb );

					// @TODO these 4 checks may not be required for "apparent" accuracy,
					// or using a larger value than EPSILON to eliminate some extra iterations
					if ( vec3.squaredLength( center_dca ) < Goblin.EPSILON ) return true;
					if ( vec3.squaredLength( center_cba ) < Goblin.EPSILON ) return true;
					if ( vec3.squaredLength( center_adb ) < Goblin.EPSILON ) return true;
					if ( vec3.squaredLength( center_dcb ) < Goblin.EPSILON ) return true;*/



					// Tetrahedron doesn't contain the origin, bail
					// Find which face normal of the tetrahedron aligns best to AO
					var best = 0, dot = 0, shortest = Infinity, distance = 0;

					// @TODO this line, repeated four times below, may not be needed:
					// if ( vec3.squaredLength( _vec3_2 ) < Goblin.EPSILON ) return true;

					// Face 1, DCA
					Goblin.GeometryMethods.findClosestPointInTriangle( origin, d.point, c.point, a.point, _vec3_2 );
					if ( vec3.squaredLength( _vec3_2 ) < Goblin.EPSILON ) {
						return true;
					}
					vec3.subtract( d.point, a.point, ab );
					vec3.subtract( c.point, a.point, ad );
					vec3.cross( ab, ad, _vec3_1 );
					//vec3.normalize( _vec3_1 );
					distance = vec3.length( _vec3_2 );
					if ( distance < shortest ) {
						shortest = distance;
						vec3.set( _vec3_1, direction );
						simplex.length = 0;
						simplex.push( a, c, d );
					}

					// Face 2, CBA
					Goblin.GeometryMethods.findClosestPointInTriangle( origin, c.point, b.point, a.point, _vec3_2 );
					if ( vec3.squaredLength( _vec3_2 ) < Goblin.EPSILON ) {
						return true;
					}
					vec3.subtract( c.point, a.point, ab );
					vec3.subtract( b.point, a.point, ad );
					vec3.cross( ab, ad, _vec3_1 );
					//vec3.normalize( _vec3_1 );
					distance = vec3.length( _vec3_2 );
					if ( distance < shortest ) {
						shortest = distance;
						vec3.set( _vec3_1, direction );
						simplex.length = 0;
						simplex.push( a, b, c );
					}

					// Face 3, ADB
					Goblin.GeometryMethods.findClosestPointInTriangle( origin, b.point, d.point, a.point, _vec3_2 );
					if ( vec3.squaredLength( _vec3_2 ) < Goblin.EPSILON ) {
						return true;
					}
					vec3.subtract( b.point, a.point, ab );
					vec3.subtract( d.point, a.point, ad );
					vec3.cross( ab, ad, _vec3_1 );
					//vec3.normalize( _vec3_1 );
					distance = vec3.length( _vec3_2 );
					if ( distance < shortest ) {
						shortest = distance;
						vec3.set( _vec3_1, direction );
						simplex.length = 0;
						simplex.push( b, d, a );
					}

					// Face 4, DCB
					Goblin.GeometryMethods.findClosestPointInTriangle( origin, d.point, b.point, c.point, _vec3_2 );
					if ( vec3.squaredLength( _vec3_2 ) < Goblin.EPSILON ) {
						return true;
					}
					vec3.subtract( d.point, c.point, ab );
					vec3.subtract( b.point, c.point, ad );
					vec3.cross( ab, ad, _vec3_1 );
					//vec3.normalize( _vec3_1 );
					distance = vec3.length( _vec3_2 );
					if ( distance < shortest ) {
						shortest = distance;
						vec3.set( _vec3_1, direction );
						simplex.length = 0;
						simplex.push( c, b, d );
					}

				}

				// Didn't contain the origin, keep looking
				return false;

			};

		return function( object_a, object_b ) {
			// Start fresh
			simplex.length = 0;
			total_checks = 0;

			// @TODO there is a big debate about what the best initial search direction is - do any answers have much weight?
			vec3.subtract( object_b.position, object_a.position, direction );
			support_point = Goblin.ObjectPool.getObject( 'GJKSupportPoint' );
			Goblin.GjkEpa.findSupportPoint( object_a, object_b, direction, support_point );
			simplex.push( support_point );

			if ( vec3.dot( simplex[0].point, direction ) < 0 ) {
				// if the last added point was not past the origin in the direction
				// then the Minkowski difference cannot possibly contain the origin because
				// the last point added is on the edge of the Minkowski difference
				return false;
			}

			vec3.negate( direction );

			while ( true ) {
				total_checks++;
				if ( total_checks === max_checks ) {
					// In case of degenerate cases
					return false;
				}

				// Add the next support point
				support_point = Goblin.ObjectPool.getObject( 'GJKSupportPoint' );
				Goblin.GjkEpa.findSupportPoint( object_a, object_b, direction, support_point );
				simplex.push( support_point );

				if ( vec3.dot( simplex[simplex.length-1].point, direction ) < 0 ) {
					// if the last added point was not past the origin in the direction
					// then the Minkowski difference cannot possibly contain the origin because
					// the last point added is on the edge of the Minkowski difference
					return false;
				}

				if ( expandSimplex( simplex, direction ) ) {
					// if it does then we know there is a collision
					return Goblin.GjkEpa.EPA( object_a, object_b, simplex );
				}
			}

		};
	})(),

	/**
	 * Performs the Expanding Polytope Algorithm on the Minkowski difference of `object_a` and `object_b`
	 *
	 * @method EPA
	 * @param object_a {Goblin.RigidBody} First object in the algorithm
	 * @param object_b {Goblin.RigidBody} Second object in the algorithm
	 * @param simplex {Array} Array containing the points in a starting simplex - the simplex returned by GJK is a great start
	 * @return {Goblin.ContactDetails} Object containing the details of the found contact point
	 */
	EPA: function( object_a, object_b, simplex ) {

		// @TODO this should be moved to the GJK face class
		function checkForSharedVertices( face1, face2 ) {
			var shared_vertices = [];

			if (
				vec3.equal( face1.a.point, face2.a.point ) ||
					vec3.equal( face1.a.point, face2.b.point ) ||
					vec3.equal( face1.a.point, face2.c.point )
				) {
				shared_vertices.push( face1.a );
			}

			if (
				vec3.equal( face1.b.point, face2.a.point ) ||
					vec3.equal( face1.b.point, face2.b.point ) ||
					vec3.equal( face1.b.point, face2.c.point )
				) {
				shared_vertices.push( face1.b );
			}

			if (
				vec3.equal( face1.c.point, face2.a.point ) ||
					vec3.equal( face1.c.point, face2.b.point ) ||
					vec3.equal( face1.c.point, face2.c.point )
				) {
				shared_vertices.push( face1.c );
			}

			return shared_vertices;
		}

		// Our GJK algorithm does not guarantee a 3-simplex result,
		// so we need to account for 1- and 2-simplexes as well

		var _vec3_1 = _tmp_vec3_1,
			_vec3_2 = _tmp_vec3_2,
			_vec3_3 = _tmp_vec3_3,
			direction = _vec3_1,
			epa_support_point;

		if ( simplex.length === 2 ) {

			// GJK ended with a line segment, set search direction to be perpendicular to the line
			vec3.cross( simplex[0].point, simplex[1].point, direction );
			epa_support_point = Goblin.ObjectPool.getObject( 'GJKSupportPoint' );
			Goblin.GjkEpa.findSupportPoint( object_a, object_b, direction, epa_support_point );
			simplex.push( epa_support_point );
		}

		if ( simplex.length === 3 ) {

			// We have a triangle, pick a side and expand on it
			var a = simplex[ 2 ],
				b = simplex[ 1 ],
				c = simplex[ 0 ],
				ao = _vec3_1, // local-variable `direction` is also mapped to _vec3_1, but is not used again until after we ae finished with `ao`
				ab = _vec3_2,
				ac = _vec3_3;

			vec3.negate( a.point, ao );
			vec3.subtract( b.point, a.point, ab );
			vec3.subtract( c.point, a.point, ac );

			// Determine the triangle's normal
			vec3.cross( ab, ac, direction );
			epa_support_point = Goblin.ObjectPool.getObject( 'GJKSupportPoint' );
			Goblin.GjkEpa.findSupportPoint( object_a, object_b, direction, epa_support_point );

			simplex.push( epa_support_point );
		}

		// We have an EPA-compatible 3-simplex,
		// first convert it into face data and then perform EPA
		// @TODO GjkFace should be included in ObjectPool for recycling
		var faces = [];
		faces.push(
			new Goblin.GjkEpa.GjkFace( simplex[0], simplex[2], simplex[3], vec3.create(), 0 ),
			new Goblin.GjkEpa.GjkFace( simplex[0], simplex[1], simplex[2], vec3.create(), 1 ),
			new Goblin.GjkEpa.GjkFace( simplex[0], simplex[3], simplex[1], vec3.create(), 2 ),
			new Goblin.GjkEpa.GjkFace( simplex[3], simplex[2], simplex[1], vec3.create(), 3 )
		);

		vec3.subtract( faces[0].b.point, faces[0].a.point, _vec3_1 );
		vec3.subtract( faces[0].c.point, faces[0].a.point, _vec3_2 );
		vec3.cross( _vec3_1, _vec3_2, faces[0].normal );
		vec3.normalize( faces[0].normal );

		vec3.subtract( faces[1].b.point, faces[1].a.point, _vec3_1 );
		vec3.subtract( faces[1].c.point, faces[1].a.point, _vec3_2 );
		vec3.cross( _vec3_1, _vec3_2, faces[1].normal );
		vec3.normalize( faces[1].normal );

		vec3.subtract( faces[2].b.point, faces[2].a.point, _vec3_1 );
		vec3.subtract( faces[2].c.point, faces[2].a.point, _vec3_2 );
		vec3.cross( _vec3_1, _vec3_2, faces[2].normal );
		vec3.normalize( faces[2].normal );

		vec3.subtract( faces[3].b.point, faces[3].a.point, _vec3_1 );
		vec3.subtract( faces[3].c.point, faces[3].a.point, _vec3_2 );
		vec3.cross( _vec3_1, _vec3_2, faces[3].normal );
		vec3.normalize( faces[3].normal );

		/*// Simplex mesh
		var vertices = [
			new THREE.Vector3( simplex[0].point[0], simplex[0].point[1], simplex[0].point[2] ),
			new THREE.Vector3( simplex[1].point[0], simplex[1].point[1], simplex[1].point[2] ),
			new THREE.Vector3( simplex[2].point[0], simplex[2].point[1], simplex[2].point[2] ),
			new THREE.Vector3( simplex[3].point[0], simplex[3].point[1], simplex[3].point[2] )
		];
		var mesh = new THREE.Mesh(
			new THREE.ConvexGeometry( vertices ),
			new THREE.MeshNormalMaterial({ opacity: 0.5 })
		);
		scene.add( mesh );*/

		/*// Simplex normals
		var test = faces[0];
		var line_geometry = new THREE.Geometry();
		line_geometry.vertices = [
			new THREE.Vector3( test.a.point[0], test.a.point[1], test.a.point[2] ),
			new THREE.Vector3( test.b.point[0], test.b.point[1], test.b.point[2] ),
			new THREE.Vector3( test.c.point[0], test.c.point[1], test.c.point[2] ),
			new THREE.Vector3( test.a.point[0], test.a.point[1], test.a.point[2] )
		];
		var line = new THREE.Line(
			line_geometry,
			new THREE.LineBasicMaterial({ color: 0x000000 })
		);
		scene.add( line );

		var line_geometry = new THREE.Geometry();
		line_geometry.vertices = [
			new THREE.Vector3(),
			new THREE.Vector3( test.normal[0], test.normal[1], test.normal[2] )
		];
		var line = new THREE.Line(
			line_geometry,
			new THREE.LineBasicMaterial({ color: 0x000000 })
		);
		scene.add( line );*/

		var last_distance = Infinity, last_face = null,
			i, j, face, distance, closest_face, closest_distance,
			origin = vec3.create(),
			closest_point = vec3.create(),
			best_closest_point = vec3.create(),
			epa_iterations = 0;

		while ( true ) {
			epa_iterations++;

			// Find the point on the closest face
			closest_distance = Infinity;
			i = faces.length - 1;
			while( i >= 0 ) {
				face = faces[i];
				if ( face === null ) {
					i--;
					continue;
				}
				Goblin.GeometryMethods.findClosestPointInTriangle( origin, face.a.point, face.b.point, face.c.point, closest_point );
				distance = vec3.squaredLength( closest_point );
				if ( distance < closest_distance ) {
					vec3.set( closest_point, best_closest_point );
					closest_distance = distance;
					closest_face = i;
				}
				i--;
			}

			if (
				(
					last_distance - closest_distance < 0.0001 && // @TODO move `.0001` to EPA.EPSILON
						last_face === faces[closest_face]
					) ||
					epa_iterations === 20
				) {
				/*// Simplex mesh
				var geometry = new THREE.Geometry, z;
				for ( z = 0; z < faces.length; z++ ) {
					if ( faces[z] !== null ) {
						geometry.vertices.push( new THREE.Vector3( faces[z].a.point[0], faces[z].a.point[1], faces[z].a.point[2] ) );
						geometry.vertices.push( new THREE.Vector3( faces[z].b.point[0], faces[z].b.point[1], faces[z].b.point[2] ) );
						geometry.vertices.push( new THREE.Vector3( faces[z].c.point[0], faces[z].c.point[1], faces[z].c.point[2] ) );
						geometry.faces.push( new THREE.Face3( geometry.vertices.length - 3, geometry.vertices.length - 2, geometry.vertices.length - 1 ) );
					}
				}
				geometry.computeFaceNormals();
				var mesh = new THREE.Mesh(
					geometry,
					new THREE.MeshNormalMaterial({ opacity: 0.5 })
				);
				scene.add( mesh );

				var line_geometry = new THREE.Geometry();
				line_geometry.vertices = [
					new THREE.Vector3( faces[closest_face].a.point[0], faces[closest_face].a.point[1], faces[closest_face].a.point[2] ),
					new THREE.Vector3( faces[closest_face].b.point[0], faces[closest_face].b.point[1], faces[closest_face].b.point[2] ),
					new THREE.Vector3( faces[closest_face].c.point[0], faces[closest_face].c.point[1], faces[closest_face].c.point[2] ),
					new THREE.Vector3( faces[closest_face].a.point[0], faces[closest_face].a.point[1], faces[closest_face].a.point[2] )
				];
				var line = new THREE.Line(
					line_geometry,
					new THREE.LineBasicMaterial({ color: 0x000000 })
				);
				scene.add( line );

				Goblin.GeometryMethods.findClosestPointInTriangle( origin, faces[closest_face].a.point, faces[closest_face].b.point, faces[closest_face].c.point, closest_point );
				var mesh = new THREE.Mesh(
					new THREE.SphereGeometry( 0.05 ),
					new THREE.MeshNormalMaterial()
				);
				mesh.position.set(
					closest_point[0], closest_point[1], closest_point[2]
				);
				scene.add( mesh );*/

				// Get a ContactDetails object and fill out its details
				var contact = Goblin.ObjectPool.getObject( 'ContactDetails' );
				contact.object_a = object_a;
				contact.object_b = object_b;

				// Contact normal is that of the closest face, pointing away from origin
				vec3.set( faces[closest_face].normal, contact.contact_normal );

				// Calculate contact position
				// @TODO this... just... ugh. Refactor.
				var barycentric = vec3.create();
				Goblin.GeometryMethods.findBarycentricCoordinates( best_closest_point, faces[closest_face].a.point, faces[closest_face].b.point, faces[closest_face].c.point, barycentric );

				if ( isNaN( barycentric[0] ) ) {
					return false;
				}

				var confirm = {
					a: vec3.create(),
					b: vec3.create(),
					c: vec3.create()
				};

				// Contact coordinates of object a
				vec3.scale( faces[closest_face].a.witness_a, barycentric[0], confirm.a );
				vec3.scale( faces[closest_face].b.witness_a, barycentric[1], confirm.b );
				vec3.scale( faces[closest_face].c.witness_a, barycentric[2], confirm.c );
				vec3.add( confirm.a, confirm.b, contact.contact_point_in_a );
				vec3.add( contact.contact_point_in_a, confirm.c );

				// Contact coordinates of object b
				vec3.scale( faces[closest_face].a.witness_b, barycentric[0], confirm.a );
				vec3.scale( faces[closest_face].b.witness_b, barycentric[1], confirm.b );
				vec3.scale( faces[closest_face].c.witness_b, barycentric[2], confirm.c );
				vec3.add( confirm.a, confirm.b, contact.contact_point_in_b );
				vec3.add( contact.contact_point_in_b, confirm.c );

				// Find actual contact point
				vec3.add( contact.contact_point_in_a, contact.contact_point_in_b, contact.contact_point );
				vec3.scale( contact.contact_point, 0.5 );

				// Convert contact_point_in_a and contact_point_in_b to those objects' local frames
				mat4.multiplyVec3( contact.object_a.transform_inverse, contact.contact_point_in_a );
				mat4.multiplyVec3( contact.object_b.transform_inverse, contact.contact_point_in_b );

				// Calculate penetration depth
				contact.penetration_depth = Math.sqrt( closest_distance );

				contact.restitution = ( object_a.restitution + object_b.restitution ) / 2;
				contact.friction = ( contact.object_a.friction + contact.object_b.friction ) / 2;

				return contact;
			}

			// Find the new support point
			epa_support_point = Goblin.ObjectPool.getObject( 'GJKSupportPoint' );
			Goblin.GjkEpa.findSupportPoint( object_a, object_b, faces[closest_face].normal, epa_support_point );

			// Compute the silhouette cast by the new vertex
			// Note that the new vertex is on the positive side
			// of the current triangle, so the current triangle will
			// not be in the convex hull. Start local search
			// from this triangle.
			var new_permament_point = epa_support_point;

			// Find all faces visible to the new vertex
			var visible_faces = [];
			for ( i = 0; i < faces.length; i++ ) {
				if ( faces[i] === null ) {
					continue;
				}

				if ( faces[i].classifyVertex( new_permament_point.point ) >= Goblin.EPSILON ) {
					visible_faces.push( faces[i] );
				}
			}
			// @TODO if there are no visible faces, is this an easy out?

			// Find all vertices shared by the visible faces
			var shared_vertices = [];
			for ( i = 0; i < visible_faces.length; i++ ) {
				for ( j = 0; j < visible_faces.length; j++ ) {
					if ( i <= j ) {
						// if i < j then we have already performed this check
						// if i === j then the two objects are the same and can't be in contact
						continue;
					}
					Array.prototype.push.apply( shared_vertices, checkForSharedVertices( visible_faces[i], visible_faces[j] ) );
				}
			}

			// Remove the visible faces and replace them
			for ( i = 0; i < visible_faces.length; i++ ) {
				face = visible_faces[i];

				var potential_faces = [];

				if ( shared_vertices.indexOf( face.a ) === -1 || shared_vertices.indexOf( face.b ) === -1 ) {
					potential_faces.push( new Goblin.GjkEpa.GjkFace( face.a, face.b, new_permament_point, vec3.create(), -1 ) );
				}

				if ( shared_vertices.indexOf( face.b ) === -1 || shared_vertices.indexOf( face.c ) === -1 ) {
					potential_faces.push( new Goblin.GjkEpa.GjkFace( face.c, new_permament_point, face.b, vec3.create(), -1 ) );
				}

				if ( shared_vertices.indexOf( face.a ) === -1 || shared_vertices.indexOf( face.c ) === -1 ) {
					potential_faces.push( new Goblin.GjkEpa.GjkFace( face.c, face.a, new_permament_point, vec3.create(), -1 ) );
				}

				if ( potential_faces.length !== 0 ) {
					faces[face.index] = null;

					Array.prototype.push.apply( faces, potential_faces );

					// Compute the new faces' normals
					for ( j = faces.length - potential_faces.length; j < faces.length; j++ ) {
						vec3.subtract( faces[j].b.point, faces[j].a.point, _vec3_1 );
						vec3.subtract( faces[j].c.point, faces[j].a.point, _vec3_2 );
						vec3.cross( _vec3_1, _vec3_2, faces[j].normal );
						vec3.normalize( faces[j].normal );
						faces[j].index = j;
					}
				}
			}

			last_distance = closest_distance;
			last_face = faces[closest_face];
		}

	}
};

/**
 * Used as a face on a GJK simplex or EPA polytope
 *
 * @class GjkFace
 * @param a {vec3} First face vertex
 * @param b {vec3} Second face vertex
 * @param c {vec3} Third face vertex
 * @param normal {vec3} Face normal
 * @param index {vec3} This face's index in the simplex
 * @constructor
 */
Goblin.GjkEpa.GjkFace = function( a, b, c, normal, index ) {
	// @TODO `normal` should be autocalculated from `a`, `b`, and `c`
	this.a = a;
	this.b = b;
	this.c = c;
	this.normal = normal;
	this.index = index;
};
/**
 * Determines if a vertex is in front of or behind the face
 *
 * @method classifyVertex
 * @param vertex {vec3} Vertex to classify
 * @return {Number} If greater than 0 (or epsilon) then `vertex' is in front of the face
 */
Goblin.GjkEpa.GjkFace.prototype.classifyVertex = function( vertex ) {
	var w = vec3.dot( this.normal, this.a.point ),
		x = vec3.dot( this.normal, vertex ) - w;
	return x;
};
Goblin.SphereSphere = function( object_a, object_b ) {
	// Cache positions of the spheres
	var position_a = object_a.position,
		position_b = object_b.position;

	// Get the vector between the two objects
	vec3.subtract( position_b, position_a, _tmp_vec3_1 );
	var distance = vec3.length( _tmp_vec3_1 );

	// If the distance between the objects is greater than their combined radii
	// then they are not touching, continue processing the other possible contacts
	if ( distance > object_a.bounding_radius + object_b.bounding_radius ) {
		return;
	}

	// Get a ContactDetails object and fill out it's information
	var contact = Goblin.ObjectPool.getObject( 'ContactDetails' );
	contact.object_a = object_a;
	contact.object_b = object_b;

	// Because we already have the distance (vector magnitude), don't call vec3.normalize
	// instead we will calculate this value manually
	vec3.scale( _tmp_vec3_1, 1 / distance, contact.contact_normal );

	// Calculate contact position
	vec3.scale( _tmp_vec3_1, -0.5 );
	vec3.add( _tmp_vec3_1, position_a, contact.contact_point );

	// Calculate penetration depth
	contact.penetration_depth = object_a.bounding_radius + object_b.bounding_radius - distance;

	// Contact points in both objects - in world coordinates at first
	vec3.scale( contact.contact_normal, contact.object_a.bounding_radius, contact.contact_point_in_a );
	vec3.add( contact.contact_point_in_a, contact.object_a.position );
	vec3.scale( contact.contact_normal, -contact.object_b.bounding_radius, contact.contact_point_in_b );
	vec3.add( contact.contact_point_in_b, contact.object_b.position );

	// Find actual contact point
	vec3.add( contact.contact_point_in_a, contact.contact_point_in_b, contact.contact_point );
	vec3.scale( contact.contact_point, 0.5 );

	// Convert contact_point_in_a and contact_point_in_b to those objects' local frames
	mat4.multiplyVec3( contact.object_a.transform_inverse, contact.contact_point_in_a );
	mat4.multiplyVec3( contact.object_b.transform_inverse, contact.contact_point_in_b );

	contact.restitution = ( object_a.restitution + object_b.restitution ) / 2;
	contact.friction = ( object_a.friction + object_b.friction ) / 2;

	return contact;
};
Goblin.Constraint = function() {
	this.object_a = null;

	this.object_b = null;

	this.rows = [];
};
Goblin.ConstraintRow = function() {
	this.jacobian = new Float64Array( 12 );
	this.B = new Float64Array( 12 ); // `B` is the jacobian multiplied by the objects' inverted mass & inertia tensors
	this.D = 0; // Diagonal of JB

	this.lower_limit = -Infinity;
	this.upper_limit = Infinity;

	this.bias = 0;
	this.multiplier = 0;
	this.multiplier_cache = 0;
	this.eta = 0; // The amount of work required of the constraint (penetration resolution, motors, etc)

	this.applied_push_impulse = 0;
};

Goblin.ContactConstraint = function() {
	Goblin.Constraint.call( this );
	this.contact = null;
};

Goblin.ContactConstraint.prototype.buildFromContact = function( contact ) {
	var row = this.rows[0] || Goblin.ObjectPool.getObject( 'ConstraintRow' );

	this.object_a = contact.object_a;
	this.object_b = contact.object_b;
	this.contact = contact;

	row.lower_limit = 0;
	row.upper_limit = Infinity;

	if ( this.object_a == null || this.object_a.mass === Infinity ) {
		row.jacobian[0] = row.jacobian[1] = row.jacobian[2] = 0;
		row.jacobian[3] = row.jacobian[4] = row.jacobian[5] = 0;
	} else {
		row.jacobian[0] = -contact.contact_normal[0];
		row.jacobian[1] = -contact.contact_normal[1];
		row.jacobian[2] = -contact.contact_normal[2];

		vec3.subtract( contact.contact_point, contact.object_a.position, _tmp_vec3_1 );
		vec3.cross( _tmp_vec3_1, contact.contact_normal, _tmp_vec3_1 );
		row.jacobian[3] = -_tmp_vec3_1[0];
		row.jacobian[4] = -_tmp_vec3_1[1];
		row.jacobian[5] = -_tmp_vec3_1[2];
	}

	if ( this.object_b == null || this.object_b.mass === Infinity ) {
		row.jacobian[6] = row.jacobian[7] = row.jacobian[8] = 0;
		row.jacobian[9] = row.jacobian[10] = row.jacobian[11] = 0;
	} else {
		row.jacobian[6] = contact.contact_normal[0];
		row.jacobian[7] = contact.contact_normal[1];
		row.jacobian[8] = contact.contact_normal[2];

		vec3.subtract( contact.contact_point, contact.object_b.position, _tmp_vec3_1 );
		vec3.cross( _tmp_vec3_1, contact.contact_normal, _tmp_vec3_1 );
		row.jacobian[9] = _tmp_vec3_1[0];
		row.jacobian[10] = _tmp_vec3_1[1];
		row.jacobian[11] = _tmp_vec3_1[2];
	}

	// Pre-calc error
	row.bias = contact.penetration_depth;

	// Apply restitution
	var dot, velocity;
	dot = vec3.dot( this.object_a.linear_velocity, contact.contact_normal );
	vec3.normalize( this.object_a.linear_velocity, _tmp_vec3_2 );
	vec3.scale( _tmp_vec3_2, dot );

	dot = vec3.dot( this.object_b.linear_velocity, contact.contact_normal );
	vec3.normalize( this.object_b.linear_velocity, _tmp_vec3_3 );
	vec3.scale( _tmp_vec3_3, dot );

	// Total collision velocity
	vec3.subtract( _tmp_vec3_2, _tmp_vec3_3 );
	velocity = vec3.length( _tmp_vec3_2 );

	// Add restitution to bias
	row.bias += velocity * contact.restitution;

	this.rows[0] = row;
};
Goblin.FrictionConstraint = function() {
	Goblin.Constraint.call( this );
};

Goblin.FrictionConstraint.prototype.buildFromContact = function( contact ) {
	var row = this.rows[0] || Goblin.ObjectPool.getObject( 'ConstraintRow' );

	this.object_a = contact.object_a;
	this.object_b = contact.object_b;

    // Find the contact point relative to object_a and object_b
    var rel_a = vec3.create(),
        rel_b = vec3.create();
    vec3.subtract( contact.contact_point, contact.object_a.position, rel_a );
    vec3.subtract( contact.contact_point, contact.object_b.position, rel_b );

    // Find the relative velocity at the contact point
    var velocity_a = vec3.create(),
        velocity_b = vec3.create();

    vec3.cross( contact.object_a.angular_velocity, rel_a, velocity_a );
    vec3.add( velocity_a, contact.object_a.linear_velocity );

    vec3.cross( contact.object_b.angular_velocity, rel_b, velocity_b );
    vec3.add( velocity_b, contact.object_b.linear_velocity );

    var relative_velocity = vec3.create();
    vec3.subtract( velocity_a, velocity_b, relative_velocity );

    // Remove velocity along contact normal
    var normal_velocity = vec3.dot( contact.contact_normal, relative_velocity );
    relative_velocity[0] -= normal_velocity * contact.contact_normal[0];
    relative_velocity[1] -= normal_velocity * contact.contact_normal[1];
    relative_velocity[2] -= normal_velocity * contact.contact_normal[2];

    var length = vec3.squaredLength( relative_velocity );
    if ( length >= Goblin.EPSILON ) {
        length = Math.sqrt( length );
        row.jacobian[0] = relative_velocity[0] / length;
        row.jacobian[1] = relative_velocity[1] / length;
        row.jacobian[2] = relative_velocity[2] / length;
        row.jacobian[6] = relative_velocity[0] / -length;
        row.jacobian[7] = relative_velocity[1] / -length;
        row.jacobian[8] = relative_velocity[2] / -length;
    } else {
        this.rows.length = 0;
        return;
    }

    // rel_a X N
    row.jacobian[3] = rel_a[1] * row.jacobian[2] - rel_a[2] * row.jacobian[1];
    row.jacobian[4] = rel_a[2] * row.jacobian[0] - rel_a[0] * row.jacobian[2];
    row.jacobian[5] = rel_a[0] * row.jacobian[1] - rel_a[1] * row.jacobian[0];

    // N X rel_b
    row.jacobian[9] = row.jacobian[1] * rel_b[2] - row.jacobian[2] * rel_b[1];
    row.jacobian[10] = row.jacobian[2] * rel_b[0] - row.jacobian[0] * rel_b[2];
    row.jacobian[11] = row.jacobian[0] * rel_b[1] - row.jacobian[1] * rel_b[0];

    row.lower_limit = -contact.friction * 1;
    row.upper_limit = contact.friction * 1;
    row.bias = 0;

    this.rows.push( row );
};
/**
 * Structure which holds information about a contact between two objects
 *
 * @Class ContactDetails
 * @param object_a {Goblin.RigidBody} first body in the contact
 * @param object_b {Goblin.RigidBody} second body in the contact
 * @param contact_point {vec3} point in world coordinates of the contact
 * @param contact_normal {wec3} normal vector, in world frame, of the contact
 * @param penetration_depth {Number} how far the objects are penetrated at the point of contact
 * @constructor
 */
Goblin.ContactDetails = function() {
	/**
	 * first body in the  contact
	 *
	 * @property object_a
	 * @type {Goblin.RigidBody}
	 */
	this.object_a = null;

	/**
	 * second body in the  contact
	 *
	 * @property object_b
	 * @type {Goblin.RigidBody}
	 */
	this.object_b = null;

	/**
	 * point of contact in world coordinates
	 *
	 * @property contact_point
	 * @type {vec3}
	 */
	this.contact_point = vec3.create();

	/**
	 * Point in 'object_a` local frame of `object_a`
	 *
	 * @property contact_point_in_a
	 * @type {vec3}
	 */
	this.contact_point_in_a = vec3.create();

	/**
	 * Point in 'object_b` local frame of `object_b`
	 *
	 * @property contact_point_in_b
	 * @type {vec3}
	 */
	this.contact_point_in_b = vec3.create();

	/**
	 * normal vector, in world frame, of the contact
	 *
	 * @property contact_normal
	 * @type {vec3}
	 */
	this.contact_normal = vec3.create();

	/**
	 * how far the objects are penetrated at the point of contact
	 *
	 * @property penetration_depth
	 * @type {Number}
	 */
	this.penetration_depth = 0;

	/**
	 * amount of restitution between the objects in contact
	 *
	 * @property restitution
	 * @type {Number}
	 */
	this.restitution = 0;

	/**
	 * amount of friction between the objects in contact
	 *
	 * @property friction
	 * @type {*}
	 */
	this.friction = 0;
};
/**
 * Structure which holds information about the contact points between two objects
 *
 * @Class ContactManifold
 * @constructor
 */
Goblin.ContactManifold = function() {
	/**
	 * First body in the contact
	 *
	 * @property object_a
	 * @type {Goblin.RigidBody}
	 */
	this.object_a = null;

	/**
	 * Second body in the contact
	 *
	 * @property object_b
	 * @type {Goblin.RigidBody}
	 */
	this.object_b = null;

	/**
	 * Holds all of the active contact points for this manifold
	 *
	 * @property points
	 * @type {Array}
	 */
	this.points = [];

	/**
	 * Reference to the next ContactManifold in the list
	 *
	 * @property next_manifold
	 * @type Goblin.ContactManifold
	 */
	this.next_manifold = null;
};

/**
 * Determines which cached contact should be replaced with the new contact
 *
 * @method findWeakestContact
 * @param {ContactDetails} new_contact
 */
Goblin.ContactManifold.prototype.findWeakestContact = function( new_contact ) {
	// Find which of the current contacts has the deepest penetration
	var max_penetration_index = -1,
		max_penetration = new_contact.penetration_depth,
		i,
		contact;
	for ( i = 0; i < 4; i++ ) {
		contact = this.points[i];
		if ( contact.penetration_depth > max_penetration ) {
			max_penetration = contact.penetration_depth;
			max_penetration_index = i;
		}
	}

	// Estimate contact areas
	var res0 = 0,
		res1 = 0,
		res2 = 0,
		res3 = 0;
	if ( max_penetration_index !== 0 ) {
		vec3.subtract( new_contact.contact_point_in_a, this.points[1].contact_point_in_a, _tmp_vec3_1 );
		vec3.subtract( this.points[3].contact_point_in_a, this.points[2].contact_point_in_a, _tmp_vec3_2 );
		vec3.cross( _tmp_vec3_1, _tmp_vec3_2 );
		res0 = vec3.squaredLength( _tmp_vec3_1 );
	}
	if ( max_penetration_index !== 1 ) {
		vec3.subtract( new_contact.contact_point_in_a, this.points[0].contact_point_in_a, _tmp_vec3_1 );
		vec3.subtract( this.points[3].contact_point_in_a, this.points[2].contact_point_in_a, _tmp_vec3_2 );
		vec3.cross( _tmp_vec3_1, _tmp_vec3_2 );
		res1 = vec3.squaredLength( _tmp_vec3_1 );
	}
	if ( max_penetration_index !== 2 ) {
		vec3.subtract( new_contact.contact_point_in_a, this.points[0].contact_point_in_a, _tmp_vec3_1 );
		vec3.subtract( this.points[3].contact_point_in_a, this.points[1].contact_point_in_a, _tmp_vec3_2 );
		vec3.cross( _tmp_vec3_1, _tmp_vec3_2 );
		res2 = vec3.squaredLength( _tmp_vec3_1 );
	}
	if ( max_penetration_index !== 3 ) {
		vec3.subtract( new_contact.contact_point_in_a, this.points[0].contact_point_in_a, _tmp_vec3_1 );
		vec3.subtract( this.points[2].contact_point_in_a, this.points[1].contact_point_in_a, _tmp_vec3_2 );
		vec3.cross( _tmp_vec3_1, _tmp_vec3_2 );
		res3 = vec3.squaredLength( _tmp_vec3_1 );
	}

	var max_index = 0,
		max_val = res0;
	if ( res1 > max_val ) {
		max_index = 1;
		max_val = res1;
	}
	if ( res2 > max_val ) {
		max_index = 2;
		max_val = res2;
	}
	if ( res3 > max_val ) {
		max_index = 3;
	}

	return max_index;
};

Goblin.ContactManifold.prototype.addContact = function( contact ) {
	//@TODO add feature-ids to detect duplicate contacts
	var i;
	for ( i = 0; i < this.points.length; i++ ) {
		if ( vec3.dist( this.points[i].contact_point, contact.contact_point ) <= 0.02 ) {
			return;
		}
	}

	// Add contact if we don't have enough points yet
	if ( this.points.length < 4 ) {
		this.points.push( contact );
	} else {
		var replace_index = this.findWeakestContact( contact );
		//@TODO give the contact back to the object pool
		this.points[replace_index] = contact;
	}
};

/**
 * Updates all of this manifold's ContactDetails with the correct contact location & penetration depth
 *
 * @method update
 */
Goblin.ContactManifold.prototype.update = function() {
	// Update positions / depths of contacts
	var i = this.points.length - 1,
		j,
		point,
		object_a_world_coords = vec3.create(),
		object_b_world_coords = vec3.create(),
		vector_difference = vec3.create();

	while( i >= 0 ) {
		point = this.points[i];

		// Convert the local contact points into world coordinates
		mat4.multiplyVec3( point.object_a.transform, point.contact_point_in_a, object_a_world_coords );
		mat4.multiplyVec3( point.object_b.transform, point.contact_point_in_b, object_b_world_coords );

		// Find new world contact point
		vec3.add( object_a_world_coords, object_b_world_coords, point.contact_point );
		vec3.scale( point.contact_point, 0.5 );

		// Find the new penetration depth
		vec3.subtract( object_a_world_coords, object_b_world_coords, vector_difference );
		point.penetration_depth = vec3.dot( vector_difference, point.contact_normal );

		// If distance from contact is too great remove this contact point
		if ( point.penetration_depth < -0.02 ) {
			// Points are too far away along the contact normal
			for ( j = this.points.length - 2; j >= i; j-- ) {
				this.points[j] = this.points[j + 1];
			}
			this.points.length = this.points.length - 1;
		} else {
			// Check if points are too far away orthogonally
			vec3.scale( point.contact_normal, point.penetration_depth, _tmp_vec3_1 );
			vec3.subtract( object_a_world_coords, _tmp_vec3_1, _tmp_vec3_1 );

			vec3.subtract( object_b_world_coords, _tmp_vec3_1, _tmp_vec3_1 );
			var distance = vec3.squaredLength( _tmp_vec3_1 );
			if ( distance > 0.02 * 0.02 ) {
				// Points are indeed too far away
				for ( j = this.points.length - 2; j >= i; j-- ) {
					this.points[j] = this.points[j + 1];
				}
				this.points.length = this.points.length - 1;
			}
		}

		i--;
	}
};
/**
 * List/Manager of ContactManifolds
 *
 * @Class ContactManifoldList
 * @constructor
 */
Goblin.ContactManifoldList = function() {
	/**
	 * The first ContactManifold in the list
	 *
	 * @property first
	 * @type {Goblin.ContactManifold}
	 */
	this.first = null;
};

/**
 * Inserts a ContactManifold into the list
 *
 * @method insert
 * @param contact_manifold contact manifold to insert into the list
 */
Goblin.ContactManifoldList.prototype.insert = function( contact_manifold ) {
	// The list is completely unordered, throw the manifold at the beginning
	contact_manifold.next_manifold = this.first;
	this.first = contact_manifold;
};

Goblin.ContactManifoldList.prototype.getManifoldForObjects = function( object_a, object_b ) {
	var manifold = null;
	if ( this.first !== null ) {
		var current = this.first;
		while ( current !== null ) {
			if (
				current.object_a === object_a && current.object_b === object_b ||
				current.object_a === object_b && current.object_b === object_a
			) {
				manifold = current;
				break;
			}
			current = current.next_manifold;
		}
	}

	if ( manifold === null ) {
		// A manifold for these two objects does not exist, create one
		manifold = Goblin.ObjectPool.getObject( 'ContactManifold' );
		manifold.object_a = object_a;
		manifold.object_b = object_b;
		this.insert( manifold );
	}

	return manifold;
};
/**
 * adds a constant force to associated objects
 *
 * @class ForceGenerator
 * @constructor
 * @param force {vec3} [optional] force the generator applies
*/
Goblin.ForceGenerator = function( force ) {
	/**
	* force which will be applied to affected objects
	*
	* @property force
	* @type {vec3}
	* @default [ 0, 0, 0 ]
	*/
	this.force = force || vec3.create();

	/**
	* whether or not the force generator is enabled
	*
	* @property enabled
	* @type {Boolean}
	* @default true
	*/
	this.enabled = true;

	/**
	* array of objects affected by the generator
	*
	* @property affected
	* @type {Array}
	* @default []
	* @private
	*/
	this.affected = [];
};
/**
* applies force to the associated objects
*
* @method applyForce
*/
Goblin.ForceGenerator.prototype.applyForce = function() {
	if ( !this.enabled ) {
		return;
	}

	var i, affected_count;
	for ( i = 0, affected_count = this.affected.length; i < affected_count; i++ ) {
		this.affected[i].applyForce( this.force );
	}
};
/**
* enables the force generator
*
* @method enable
*/
Goblin.ForceGenerator.prototype.enable = function() {
	this.enabled = true;
};
/**
* disables the force generator
*
* @method disable
*/
Goblin.ForceGenerator.prototype.disable = function() {
	this.enabled = false;
};
/**
* adds an object to be affected by the generator
*
* @method affect
* @param object {Mixed} object to be affected, must have `applyForce` method
*/
Goblin.ForceGenerator.prototype.affect = function( object ) {
	var i, affected_count;
	// Make sure this object isn't already affected
	for ( i = 0, affected_count = this.affected.length; i < affected_count; i++ ) {
		if ( this.affected[i] === object ) {
			return;
		}
	}

	this.affected.push( object );
};
/**
* removes an object from being affected by the generator
*
* @method unaffect
* @param object {Mixed} object to be affected, must have `applyForce` method
*/
Goblin.ForceGenerator.prototype.unaffect = function( object ) {
	var i, affected_count;
	for ( i = 0, affected_count = this.affected.length; i < affected_count; i++ ) {
		if ( this.affected[i] === object ) {
			this.affected.splice( i, 1 );
			return;
		}
	}
};
/**
* adds a drag force to associated objects
*
* @class DragForce
* @extends ForceGenerator
* @constructor
*/
Goblin.DragForce = function( drag_coefficient, squared_drag_coefficient ) {
	/**
	* drag coefficient
	*
	* @property drag_coefficient
	* @type {Number}
	* @default 0
	*/
	this.drag_coefficient = drag_coefficient || 0;

	/**
	* drag coefficient
	*
	* @property drag_coefficient
	* @type {Number}
	* @default 0
	*/
	this.squared_drag_coefficient = squared_drag_coefficient || 0;

	/**
	* whether or not the force generator is enabled
	*
	* @property enabled
	* @type {Boolean}
	* @default true
	*/
	this.enabled = true;

	/**
	* array of objects affected by the generator
	*
	* @property affected
	* @type {Array}
	* @default []
	* @private
	*/
	this.affected = [];
};
Goblin.DragForce.prototype.enable = Goblin.ForceGenerator.prototype.enable;
Goblin.DragForce.prototype.disable = Goblin.ForceGenerator.prototype.disable;
Goblin.DragForce.prototype.affect = Goblin.ForceGenerator.prototype.affect;
Goblin.DragForce.prototype.unaffect = Goblin.ForceGenerator.prototype.unaffect;
/**
* applies force to the associated objects
*
* @method applyForce
*/
Goblin.DragForce.prototype.applyForce = function() {
	if ( !this.enabled ) {
		return;
	}

	var i, affected_count, object, drag,
		force = _tmp_vec3_1;

	for ( i = 0, affected_count = this.affected.length; i < affected_count; i++ ) {
		object = this.affected[i];

		vec3.set( object.linear_velocity, force );

		// Calculate the total drag coefficient.
		drag = vec3.length( force );
		drag = ( this.drag_coefficient * drag ) + ( this.squared_drag_coefficient * drag * drag );

		// Calculate the final force and apply it.
		vec3.normalize( force );
		vec3.scale( force, -drag );
		object.applyForce( force );
	}
};
/**
 * Provides methods useful for working with various types of geometries
 *
 * @class GeometryMethods
 * @static
 */
Goblin.GeometryMethods = {
	findClosestPointInTriangle: function() {
		var ab = vec3.create(),
			ac = vec3.create(),
			_vec = vec3.create();

		// @TODO performance benefit to moving all of the float variables created below into one Float64Array?

		return function( p, a, b, c, out ) {
			var v;

			// Check if P in vertex region outside A
			vec3.subtract( b, a, ab );
			vec3.subtract( c, a, ac );
			vec3.subtract( p, a, _vec );
			var d1 = vec3.dot( ab, _vec ),
				d2 = vec3.dot( ac, _vec );
			if ( d1 <= 0 && d2 <= 0 ) {
				vec3.set( a, out );
				return;
			}

			// Check if P in vertex region outside B
			vec3.subtract( p, b, _vec );
			var d3 = vec3.dot( ab, _vec ),
				d4 = vec3.dot( ac, _vec );
			if ( d3 >= 0 && d4 <= d3 ) {
				vec3.set( b, out );
				return;
			}

			// Check if P in edge region of AB
			var vc = d1*d4 - d3*d2;
			if ( vc <= 0 && d1 >= 0 && d3 <= 0 ) {
				v = d1 / ( d1 - d3 );
				vec3.scale( ab, v, out );
				vec3.add( out, a );
				return;
			}

			// Check if P in vertex region outside C
			vec3.subtract( p, c, _vec );
			var d5 = vec3.dot( ab, _vec ),
				d6 = vec3.dot( ac, _vec );
			if ( d6 >= 0 && d5 <= d6 ) {
				vec3.set( c, out );
				return;
			}

			// Check if P in edge region of AC
			var vb = d5*d2 - d1*d6,
				w;
			if ( vb <= 0 && d2 >= 0 && d6 <= 0 ) {
				w = d2 / ( d2 - d6 );
				vec3.scale( ac, w, out );
				vec3.add( out, a );
				return;
			}

			// Check if P in edge region of BC
			var va = d3*d6 - d5*d4;
			if ( va <= 0 && d4-d3 >= 0 && d5-d6 >= 0 ) {
				w = (d4 - d3) / ( (d4-d3) + (d5-d6) );
				vec3.subtract( c, b, out );
				vec3.scale( out, w );
				vec3.add( out, b );
				return;
			}

			// P inside face region
			var denom = 1 / ( va + vb + vc );
			v = vb * denom;
			w = vc * denom;


			// At this point `ab` and `ac` can be recycled and lose meaning to their nomenclature

			vec3.scale( ab, v );
			vec3.add( ab, a );

			vec3.scale( ac, w );

			vec3.add( ab, ac, out );
		};
	}(),

	/**
	 * Finds the Barycentric coordinates of point `p` in the triangle `a`, `b`, `c`
	 *
	 * @method findBarycentricCoordinates
	 * @param p {vec3} Point to calculate coordinates of
	 * @param a {vec3} First point in the triangle
	 * @param b {vec3} Second point in the triangle
	 * @param c {vec3} Third point in the triangle
	 * @param out {vec3} Resulting Barycentric coordinates of point `p`
	 */
	findBarycentricCoordinates: function( p, a, b, c, out ) {

		var v0 = vec3.create(),
			v1 = vec3.create(),
			v2 = vec3.create();

		vec3.subtract( b, a, v0 );
		vec3.subtract( c, a, v1 );
		vec3.subtract( p, a, v2 );

		// @TODO the dot product of a vector against itself is the same as that vector's length, squared. Which method is faster? V dot V or ||V||^2 ?
		var d00 = vec3.dot( v0, v0 ),
			d01 = vec3.dot( v0, v1 ),
			d11 = vec3.dot( v1, v1 ),
			d20 = vec3.dot( v2, v0 ),
			d21 = vec3.dot( v2, v1 ),
			denom = d00 * d11 - d01 * d01;

		out[1] = ( d11 * d20 - d01 * d21 ) / denom;
		out[2] = ( d00 * d21 - d01 * d20 ) / denom;
		out[0] = 1 - out[1] - out[2];
	}
};

// mappings for closure compiler
Goblin.GeometryMethods = Goblin.GeometryMethods;
Goblin.GeometryMethods.findClosestPointInTriangle = Goblin.GeometryMethods.findClosestPointInTriangle;
Goblin.GeometryMethods.findBarycentricCoordinates = Goblin.GeometryMethods.findBarycentricCoordinates;
Goblin.Matrix4 = function() {
    this.components = new Float64Array( 16 );
    // Default to identity matrix
    this.components[0] = this.components[4] = this.components[8] = this.components[12] = 1.0;
};

Goblin.Matrix4.prototype.set = function( c00, c01, c02, c03, c10, c11, c12, c13, c20, c21, c22, c23, c30, c31, c32, c33 ) {
    this.components[0] = c00;
    this.components[1] = c01;
    this.components[2] = c02;
    this.components[3] = c03;
    this.components[4] = c10;
    this.components[5] = c11;
    this.components[6] = c12;
    this.components[7] = c13;
    this.components[8] = c20;
    this.components[9] = c21;
    this.components[10] = c22;
    this.components[11] = c23;
    this.components[12] = c30;
    this.components[13] = c31;
    this.components[14] = c32;
    this.components[15] = c33;
};

Goblin.Matrix4.prototype.identity = function( ) {
    this.components[0] = this.components[4] = this.components[8] = this.components[12] = 1.0;
    this.components[1] = this.components[2] = this.components[3] = this.components[5] = this.components[6] = this.components[7] = this.components[9] = this.components[10] = this.components[11] = this.components[13] = this.components[14] = this.components[15] = 0.0;
};

Goblin.Matrix4.prototype.transpose = function() {
    var c01 = this.components[1],
        c02 = this.components[2],
        c03 = this.components[3],
        c12 = this.components[6],
        c13 = this.components[7],
        c23 = this.components[11];

    this.components[1] = this.components[4];
    this.components[2] = this.components[8];
    this.components[3] = this.components[12];
    this.components[4] = c01;
    this.components[6] = this.components[9];
    this.components[7] = this.components[13];
    this.components[8] = c02;
    this.components[9] = c12;
    this.components[11] = this.components[14];
    this.components[12] = c03;
    this.components[13] = c13;
    this.components[14] = c23;
};

Goblin.Matrix4.prototype.determinant = function() {
    return (this.components[12] * this.components[9] * this.components[6] * this.components[3] - this.components[8] * this.components[13] * this.components[6] * this.components[3] - this.components[12] * this.components[5] * this.components[10] * this.components[3] + this.components[4] * this.components[13] * this.components[10] * this.components[3] +
        this.components[8] * this.components[5] * this.components[14] * this.components[3] - this.components[4] * this.components[9] * this.components[14] * this.components[3] - this.components[12] * this.components[9] * this.components[2] * this.components[7] + this.components[8] * this.components[13] * this.components[2] * this.components[7] +
        this.components[12] * this.components[1] * this.components[10] * this.components[7] - this.components[0] * this.components[13] * this.components[10] * this.components[7] - this.components[8] * this.components[1] * this.components[14] * this.components[7] + this.components[0] * this.components[9] * this.components[14] * this.components[7] +
        this.components[12] * this.components[5] * this.components[2] * this.components[11] - this.components[4] * this.components[13] * this.components[2] * this.components[11] - this.components[12] * this.components[1] * this.components[6] * this.components[11] + this.components[0] * this.components[13] * this.components[6] * this.components[11] +
        this.components[4] * this.components[1] * this.components[14] * this.components[11] - this.components[0] * this.components[5] * this.components[14] * this.components[11] - this.components[8] * this.components[5] * this.components[2] * this.components[15] + this.components[4] * this.components[9] * this.components[2] * this.components[15] +
        this.components[8] * this.components[1] * this.components[6] * this.components[15] - this.components[0] * this.components[9] * this.components[6] * this.components[15] - this.components[4] * this.components[1] * this.components[10] * this.components[15] + this.components[0] * this.components[5] * this.components[10] * this.components[15]);
};

Goblin.Matrix4.prototype.inverse = function( ) {
    var a00 = this.components[0], a01 = this.components[1], a02 = this.components[2], a03 = this.components[3],
        a10 = this.components[4], a11 = this.components[5], a12 = this.components[6], a13 = this.components[7],
        a20 = this.components[8], a21 = this.components[9], a22 = this.components[10], a23 = this.components[11],
        a30 = this.components[12], a31 = this.components[13], a32 = this.components[14], a33 = this.components[15],

        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,

        d = ( b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06 ),
        invDet;

    // Calculate the determinant
    if ( !d ) { return; }
    invDet = 1 / d;

    this.components[0] = ( a11 * b11 - a12 * b10 + a13 * b09 ) * invDet;
    this.components[1] = ( -a01 * b11 + a02 * b10 - a03 * b09 ) * invDet;
    this.components[2] = ( a31 * b05 - a32 * b04 + a33 * b03 ) * invDet;
    this.components[3] = ( -a21 * b05 + a22 * b04 - a23 * b03 ) * invDet;
    this.components[4] = ( -a10 * b11 + a12 * b08 - a13 * b07 ) * invDet;
    this.components[5] = ( a00 * b11 - a02 * b08 + a03 * b07 ) * invDet;
    this.components[6] = ( -a30 * b05 + a32 * b02 - a33 * b01 ) * invDet;
    this.components[7] = ( a20 * b05 - a22 * b02 + a23 * b01 ) * invDet;
    this.components[8] = ( a10 * b10 - a11 * b08 + a13 * b06 ) * invDet;
    this.components[9] = ( -a00 * b10 + a01 * b08 - a03 * b06 ) * invDet;
    this.components[10] = ( a30 * b04 - a31 * b02 + a33 * b00 ) * invDet;
    this.components[11] = ( -a20 * b04 + a21 * b02 - a23 * b00 ) * invDet;
    this.components[12] = ( -a10 * b09 + a11 * b07 - a12 * b06 ) * invDet;
    this.components[13] = ( a00 * b09 - a01 * b07 + a02 * b06 ) * invDet;
    this.components[14] = ( -a30 * b03 + a31 * b01 - a32 * b00 ) * invDet;
    this.components[15] = ( a20 * b03 - a21 * b01 + a22 * b00 ) * invDet;
};

Goblin.Matrix4.prototype.multiply = function( mat ) {
    var a00 = this.components[ 0], a01 = this.components[ 1], a02 = this.components[ 2], a03 = this.components[3],
        a10 = this.components[ 4], a11 = this.components[ 5], a12 = this.components[ 6], a13 = this.components[7],
        a20 = this.components[ 8], a21 = this.components[ 9], a22 = this.components[10], a23 = this.components[11],
        a30 = this.components[12], a31 = this.components[13], a32 = this.components[14], a33 = this.components[15];

    // Cache only the current line of the second matrix
    var b0  = mat.components[0], b1 = mat.components[1], b2 = mat.components[2], b3 = mat.components[3];
    this.components[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    this.components[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    this.components[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    this.components[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = mat.components[4];
    b1 = mat.components[5];
    b2 = mat.components[6];
    b3 = mat.components[7];
    this.components[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    this.components[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    this.components[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    this.components[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = mat.components[8];
    b1 = mat.components[9];
    b2 = mat.components[10];
    b3 = mat.components[11];
    this.components[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    this.components[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    this.components[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    this.components[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = mat.components[12];
    b1 = mat.components[13];
    b2 = mat.components[14];
    b3 = mat.components[15];
    this.components[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    this.components[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    this.components[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    this.components[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
};

Goblin.Matrix4.prototype.multiplyResult = function( mat1, mat2 ) {
    var a00 = mat1.components[ 0], a01 = mat1.components[ 1], a02 = mat1.components[ 2], a03 = mat1.components[3],
        a10 = mat1.components[ 4], a11 = mat1.components[ 5], a12 = mat1.components[ 6], a13 = mat1.components[7],
        a20 = mat1.components[ 8], a21 = mat1.components[ 9], a22 = mat1.components[10], a23 = mat1.components[11],
        a30 = mat1.components[12], a31 = mat1.components[13], a32 = mat1.components[14], a33 = mat1.components[15];

    // Cache only the current line of the second mat2rix
    var b0  = mat2.components[0], b1 = mat2.components[1], b2 = mat2.components[2], b3 = mat2.components[3];
    this.components[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    this.components[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    this.components[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    this.components[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = mat2.components[4];
    b1 = mat2.components[5];
    b2 = mat2.components[6];
    b3 = mat2.components[7];
    this.components[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    this.components[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    this.components[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    this.components[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = mat2.components[8];
    b1 = mat2.components[9];
    b2 = mat2.components[10];
    b3 = mat2.components[11];
    this.components[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    this.components[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    this.components[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    this.components[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    b0 = mat2.components[12];
    b1 = mat2.components[13];
    b2 = mat2.components[14];
    b3 = mat2.components[15];
    this.components[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    this.components[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    this.components[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    this.components[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
};

Goblin.Matrix4.prototype.translate = function( vec ) {
    var x = vec.components[0], y = vec.components[1], z = vec.components[2],
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23;

    this.components[12] = this.components[0] * x + this.components[4] * y + this.components[8] * z + this.components[12];
    this.components[13] = this.components[1] * x + this.components[5] * y + this.components[9] * z + this.components[13];
    this.components[14] = this.components[2] * x + this.components[6] * y + this.components[10] * z + this.components[14];
    this.components[15] = this.components[3] * x + this.components[7] * y + this.components[11] * z + this.components[15];
};

Goblin.Matrix4.prototype.fromRotationTranslation = function( quat, vec ) {
    var x = quat.components[0], y = quat.components[1], z = quat.components[2], w = quat.components[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    this.components[0] = 1 - (yy + zz);
    this.components[1] = xy + wz;
    this.components[2] = xz - wy;
    this.components[3] = 0;
    this.components[4] = xy - wz;
    this.components[5] = 1 - (xx + zz);
    this.components[6] = yz + wx;
    this.components[7] = 0;
    this.components[8] = xz + wy;
    this.components[9] = yz - wx;
    this.components[10] = 1 - (xx + yy);
    this.components[11] = 0;
    this.components[12] = vec.components[0];
    this.components[13] = vec.components[1];
    this.components[14] = vec.components[2];
    this.components[15] = 1;
};

Goblin.Matrix4.prototype.fromQuaternion = function( quat ) {
    var x = quat.components[0], y = quat.components[1], z = quat.components[2], w = quat.components[3],
        x2 = x + x,
        y2 = y + y,
        z2 = z + z,

        xx = x * x2,
        xy = x * y2,
        xz = x * z2,
        yy = y * y2,
        yz = y * z2,
        zz = z * z2,
        wx = w * x2,
        wy = w * y2,
        wz = w * z2;

    this.components[0] = 1 - (yy + zz);
    this.components[1] = xy + wz;
    this.components[2] = xz - wy;
    this.components[3] = 0;

    this.components[4] = xy - wz;
    this.components[5] = 1 - (xx + zz);
    this.components[6] = yz + wx;
    this.components[7] = 0;

    this.components[8] = xz + wy;
    this.components[9] = yz - wx;
    this.components[10] = 1 - (xx + yy);
    this.components[11] = 0;

    this.components[12] = 0;
    this.components[13] = 0;
    this.components[14] = 0;
    this.components[15] = 1;
};

Goblin.Matrix4 = Goblin.Matrix4;
Goblin.Matrix4.prototype.set = Goblin.Matrix4.prototype.set;
Goblin.Matrix4.prototype.identity = Goblin.Matrix4.prototype.identity;
Goblin.Matrix4.prototype.transpose = Goblin.Matrix4.prototype.transpose;
Goblin.Matrix4.prototype.determinant = Goblin.Matrix4.prototype.determinant;
Goblin.Matrix4.prototype.inverse = Goblin.Matrix4.prototype.inverse;
Goblin.Matrix4.prototype.multiply = Goblin.Matrix4.prototype.multiply;
Goblin.Matrix4.prototype.multiplyResult = Goblin.Matrix4.prototype.multiplyResult;
Goblin.Matrix4.prototype.translate = Goblin.Matrix4.prototype.translate;
Goblin.Matrix4.prototype.fromRotationTranslate = Goblin.Matrix4.prototype.fromRotationTranslate;
Goblin.Matrix4.prototype.fromQuaternion = Goblin.Matrix4.prototype.fromQuaternio;
Goblin.Quaternion = function( x, y, z, w ) {
    this.components = new Float64Array( 4 );
    this.components[0] = x;
    this.components[1] = y;
    this.components[2] = z;
    this.components[3] = w;
};

Goblin.Quaternion.prototype.set = function( x, y, z, w ) {
    this.components[0] = x;
    this.components[1] = y;
    this.components[2] = z;
    this.components[3] = w;
};

Goblin.Quaternion.prototype.identity = function() {
    this.components[0] = 0;
    this.components[1] = 0;
    this.components[2] = 0;
    this.components[3] = 1;
};

Goblin.Quaternion.prototype.calculateW = function() {
    this.components[3] = -Math.sqrt( Math.abs( 1.0 - this.components[0] * this.components[0] - this.components[1] * this.components[1] - this.components[2] * this.components[2] ) );
};

Goblin.Quaternion.prototype.dot = function( quat ) {
    return this.components[0] * quat.components[0] + this.components[1] * quat.components[1] + this.components[2] * quat.components[2] + this.components[3] * quat.components[3];
};

Goblin.Quaternion.prototype.inverse = function() {
    var q0 = this.components[0], q1 = this.components[1], q2 = this.components[2], q3 = this.components[3],
        dot = q0 * q0 + q1 * q1 + q2 * q2 + q3 * q3,
        invDot = dot ? 1.0 / dot : 0;

    this.components[0] *= -invDot;
    this.components[1] *= -invDot;
    this.components[2] *= -invDot;
    this.components[3] *= invDot;
};

Goblin.Quaternion.prototype.inverseResult = function( quat ) {
    var q0 = quat.components[0], q1 = quat.components[1], q2 = quat.components[2], q3 = quat.components[3],
        dot = q0 * q0 + q1 * q1 + q2 * q2 + q3 * q3,
        invDot = dot ? 1.0 / dot : 0;

    this.components[0] *= -invDot;
    this.components[1] *= -invDot;
    this.components[2] *= -invDot;
    this.components[3] *= invDot;
};

Goblin.Quaternion.prototype.conjugate = function() {
    this.components[0] *= -1;
    this.components[1] *= -1;
    this.components[2] *= -1;
};

Goblin.Quaternion.prototype.conjugateResult = function( quat ) {
    this.components[0] = quat.components[0] * -1;
    this.components[1] = quat.components[1] * -1;
    this.components[2] = quat.components[2] * -1;
};

Goblin.Quaternion.prototype.length = function() {
    return Math.sqrt( this.components[0] * this.components[0] + this.components[1] * this.components[1] + this.components[2] * this.components[2] + this.components[3] * this.components[3] );
};

Goblin.Quaternion.prototype.normalize = function() {
    var x = this.components[0], y = this.components[1], z = this.components[2], w = this.components[3],
        len = Math.sqrt( x * x + y * y + z * z + w * w );
    if (len === 0) {
        this.components[0] = 0;
        this.components[1] = 0;
        this.components[2] = 0;
        this.components[3] = 0;
        return;
    }
    len = 1 / len;
    this.components[0] = x * len;
    this.components[1] = y * len;
    this.components[2] = z * len;
    this.components[3] = w * len;
};

Goblin.Quaternion.prototype.add = function( quat ) {
    this.components[0] += quat.components[0];
    this.components[1] += quat.components[1];
    this.components[2] += quat.components[2];
    this.components[3] += quat.components[3];
};

Goblin.Quaternion.prototype.addResult = function( quat1, quat2 ) {
    this.components[0] = quat1.components[0] + quat2.components[0];
    this.components[1] = quat1.components[1] + quat2.components[1];
    this.components[2] = quat1.components[2] + quat2.components[2];
    this.components[3] = quat1.components[3] + quat2.components[3];
};

Goblin.Quaternion.prototype.multiply = function( quat ) {
    var qax = this.components[0], qay = this.components[1], qaz = this.components[2], qaw = this.components[3],
        qbx = quat.components[0], qby = quat.components[1], qbz = quat.components[2], qbw = quat.components[3];

    this.components[0] = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
    this.components[1] = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
    this.components[2] = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
    this.components[3] = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
};

Goblin.Quaternion.prototype.multiplyResult = function( quat1, quat2 ) {
    var qax = quat1.components[0], qay = quat1.components[1], qaz = quat1.components[2], qaw = quat1.components[3],
        qbx = quat2.components[0], qby = quat2.components[1], qbz = quat2.components[2], qbw = quat2.components[3];

    this.components[0] = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
    this.components[1] = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
    this.components[2] = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
    this.components[3] = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;
};

Goblin.Quaternion.prototype.slerp = function( quat, slerp ) {
    var cosHalfTheta = this.components[0] * quat.components[0] + this.components[1] * quat.components[1] + this.components[2] * quat.components[2] + this.components[3] * quat.components[3],
        halfTheta,
        sinHalfTheta,
        ratioA,
        ratioB;

    if ( Math.abs( cosHalfTheta ) >= 1.0 ) {
        return;
    }

    halfTheta = Math.acos( cosHalfTheta );
    sinHalfTheta = Math.sqrt( 1.0 - cosHalfTheta * cosHalfTheta );

    if ( Math.abs( sinHalfTheta ) < 0.001 ) {
        this.components[0] = ( this.components[0] * 0.5 + quat.components[0] * 0.5 );
        this.components[1] = ( this.components[1] * 0.5 + quat.components[1] * 0.5 );
        this.components[2] = ( this.components[2] * 0.5 + quat.components[2] * 0.5 );
        this.components[3] = ( this.components[3] * 0.5 + quat.components[3] * 0.5 );
        return;
    }

    ratioA = Math.sin( ( 1 - slerp ) * halfTheta ) / sinHalfTheta;
    ratioB = Math.sin( slerp * halfTheta ) / sinHalfTheta;

    this.components[0] = ( this.components[0] * ratioA + quat.components[0] * ratioB );
    this.components[1] = ( this.components[1] * ratioA + quat.components[1] * ratioB );
    this.components[2] = ( this.components[2] * ratioA + quat.components[2] * ratioB );
    this.components[3] = ( this.components[3] * ratioA + quat.components[3] * ratioB );
};

Goblin.Quaternion.prototype.fromAngleAxis = function( angle, axis ) {
    var half = angle * 0.5,
        s = Math.sin( half );

    this.components[0] = s * axis.components[0];
    this.components[1] = s * axis.components[1];
    this.components[2] = s * axis.components[2];
    this.components[3] = Math.cos( half );
};

Goblin.Quaternion = Goblin.Quaternion;
Goblin.Quaternion.prototype.set = Goblin.Quaternion.prototype.set;
Goblin.Quaternion.prototype.identity = Goblin.Quaternion.prototype.identity;
Goblin.Quaternion.prototype.calculateW = Goblin.Quaternion.prototype.calculateW;
Goblin.Quaternion.prototype.dot = Goblin.Quaternion.prototype.dot;
Goblin.Quaternion.prototype.inverse = Goblin.Quaternion.prototype.inverse;
Goblin.Quaternion.prototype.inverseResult = Goblin.Quaternion.prototype.inverseResult;
Goblin.Quaternion.prototype.conjugate = Goblin.Quaternion.prototype.conjugate;
Goblin.Quaternion.prototype.conjugateResult = Goblin.Quaternion.prototype.conjugateResult;
Goblin.Quaternion.prototype.length = Goblin.Quaternion.prototype.length;
Goblin.Quaternion.prototype.normalize = Goblin.Quaternion.prototype.normalize;
Goblin.Quaternion.prototype.add = Goblin.Quaternion.prototype.add;
Goblin.Quaternion.prototype.addResult = Goblin.Quaternion.prototype.addResult;
Goblin.Quaternion.prototype.multiply = Goblin.Quaternion.prototype.multiply;
Goblin.Quaternion.prototype.multiplyResult = Goblin.Quaternion.prototype.multiplyResult;
Goblin.Quaternion.prototype.slerp = Goblin.Quaternion.prototype.slerp;
Goblin.Quaternion.prototype.fromAngleAxis = Goblin.Quaternion.prototype.fromAngleAxis;
Goblin.Vector3 = function( x, y, z ) {
    this.components = new Float64Array( 3 );
    this.components[0] = x;
    this.components[1] = y;
    this.components[2] = z;
};

Goblin.Vector3.prototype.set = function( x, y, z ) {
    this.components[0] = x;
    this.components[1] = y;
    this.components[2] = z;
};

Goblin.Vector3.prototype.copy = function( vec ) {
    this.components[0] = vec.components[0];
    this.components[1] = vec.components[1];
    this.components[2] = vec.components[2];
};

Goblin.Vector3.prototype.equals = function( vec ) {
    if (
        Math.abs( this.components[0] - vec.components[0] ) > Goblin.EPSILON ||
            Math.abs( this.components[1] - vec.components[1] ) > Goblin.EPSILON ||
            Math.abs( this.components[2] - vec.components[2] ) > Goblin.EPSILON
        ) {
        return false;
    }
    return true;
};

Goblin.Vector3.prototype.add = function( vec ) {
    this.components[0] += vec.components[0];
    this.components[1] += vec.components[1];
    this.components[2] += vec.components[2];
};

Goblin.Vector3.prototype.addScaled = function( vec, scale ) {
    this.components[0] += vec.components[0] * scale;
    this.components[1] += vec.components[1] * scale;
    this.components[2] += vec.components[2] * scale;
};

Goblin.Vector3.prototype.multiplyScalar = function( s ) {
    this.components[0] *= s;
    this.components[1] *= s;
    this.components[2] *= s;
};

Goblin.Vector3.prototype.multiply = function( vec ) {
    this.components[0] *= vec.components[0];
    this.components[1] *= vec.components[1];
    this.components[2] *= vec.components[2];
};

Goblin.Vector3.prototype.negate = function() {
    this.components[0] *= -1;
    this.components[1] *= -1;
    this.components[2] *= -1;
};

Goblin.Vector3.prototype.normalize = function() {
    var length = Math.sqrt( this.components[0] * this.components[0] + this.components[1] * this.components[1] + this.components[2] * this.components[2] ),
        length_inv;

    if ( length === 1 ) {
        return;
    }

    length_inv = 1 / length;
    this.components[0] *= length_inv;
    this.components[1] *= length_inv;
    this.components[2] *= length_inv;
};

Goblin.Vector3.prototype.length = function() {
    return Math.sqrt( this.components[0] * this.components[0] + this.components[1] * this.components[1] + this.components[2] * this.components[2] );
};

Goblin.Vector3.prototype.lengthSquared = function() {
    return this.components[0] * this.components[0] + this.components[1] * this.components[1] + this.components[2] * this.components[2];
};

Goblin.Vector3.prototype.cross = function( vec ) {
    var x = this.components[0],
        y = this.components[1],
        z = this.components[2],
        x2 = vec.components[0],
        y2 = vec.components[1],
        z2 = vec.components[2];
    this.components[0] = y * z2 - z * y2;
    this.components[1] = z * x2 - x * z2;
    this.components[2] = x * y2 - y * x2;
};
Goblin.Vector3.prototype.crossResult = function( vec_a, vec_b ) {
    var x = vec_a.components[0],
        y = vec_a.components[1],
        z = vec_a.components[2],
        x2 = vec_b.components[0],
        y2 = vec_b.components[1],
        z2 = vec_b.components[2];
    this.components[0] = y * z2 - z * y2;
    this.components[1] = z * x2 - x * z2;
    this.components[2] = x * y2 - y * x2;
};

Goblin.Vector3.prototype.dot = function( vec ) {
    return this.components[0] * vec.components[0] + this.components[1] * vec.components[1] + this.components[2] * vec.components[2];
};

Goblin.Vector3.prototype.matrix4Transform = function( mat ) {
    var x = this.components[0],
        y = this.components[1],
        z = this.components[2];

    this.components[0] = mat.components[0] * x + mat.components[4] * y + mat.components[8] * z + mat.components[12];
    this.components[1] = mat.components[1] * x + mat.components[5] * y + mat.components[9] * z + mat.components[13];
    this.components[2] = mat.components[2] * x + mat.components[6] * y + mat.components[10] * z + mat.components[14];
};

Goblin.Vector3.prototype.matrix4TransformResult = function( mat, vec ) {
    var x = vec.components[0],
        y = vec.components[1],
        z = vec.components[2];

    this.components[0] = mat.components[0] * x + mat.components[4] * y + mat.components[8] * z + mat.components[12];
    this.components[1] = mat.components[1] * x + mat.components[5] * y + mat.components[9] * z + mat.components[13];
    this.components[2] = mat.components[2] * x + mat.components[6] * y + mat.components[10] * z + mat.components[14];
};

Goblin.Vector3.prototype.quaternionTransform = function( quat ) {
    var x = this.components[0], y = this.components[1], z = this.components[2],
        qx = quat.components[0], qy = quat.components[1], qz = quat.components[2], qw = quat.components[3],

    // calculate quat * vec
        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    this.components[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    this.components[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    this.components[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
};

Goblin.Vector3.prototype.quaternionTransformResult = function( quat, vec ) {
    var x = vec.components[0], y = vec.components[1], z = vec.components[2],
        qx = quat.components[0], qy = quat.components[1], qz = quat.components[2], qw = quat.components[3],

    // calculate quat * vec
        ix = qw * x + qy * z - qz * y,
        iy = qw * y + qz * x - qx * z,
        iz = qw * z + qx * y - qy * x,
        iw = -qx * x - qy * y - qz * z;

    // calculate result * inverse quat
    this.components[0] = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    this.components[1] = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    this.components[2] = iz * qw + iw * -qz + ix * -qy - iy * -qx;
};

Goblin.Vector3 = Goblin.Vector3;
Goblin.Vector3.prototype.set = Goblin.Vector3.prototype.set;
Goblin.Vector3.prototype.copy = Goblin.Vector3.prototype.copy;
Goblin.Vector3.prototype.equals = Goblin.Vector3.prototype.equals;
Goblin.Vector3.prototype.add = Goblin.Vector3.prototype.add;
Goblin.Vector3.prototype.addScaled = Goblin.Vector3.prototype.addScaled;
Goblin.Vector3.prototype.multiplyScalar = Goblin.Vector3.prototype.multiplyScalar;
Goblin.Vector3.prototype.multiply = Goblin.Vector3.prototype.multiply;
Goblin.Vector3.prototype.negate = Goblin.Vector3.prototype.negate;
Goblin.Vector3.prototype.normalize = Goblin.Vector3.prototype.normalize;
Goblin.Vector3.prototype.length = Goblin.Vector3.prototype.length;
Goblin.Vector3.prototype.lengthSquared = Goblin.Vector3.prototype.lengthSquared;
Goblin.Vector3.prototype.cross = Goblin.Vector3.prototype.cross;
Goblin.Vector3.prototype.crossResult = Goblin.Vector3.prototype.crossResult;
Goblin.Vector3.prototype.dot = Goblin.Vector3.prototype.dot;
Goblin.Vector3.prototype.matrix4Transform = Goblin.Vector3.prototype.matrix4Transform;
Goblin.Vector3.prototype.matrix4TransformResult = Goblin.Vector3.prototype.matrix4TransformResult;
Goblin.Vector3.prototype.quaternionTransform = Goblin.Vector3.prototype.quaternionTransform;
Goblin.Vector3.prototype.quaternionTransformResult = Goblin.Vector3.prototype.quaternionTransformResult;
/**
 * Takes possible contacts found by a broad phase and determines if they are legitimate contacts
 *
 * @class NearPhase
 * @constructor
 */
Goblin.NearPhase = function() {
	/**
	 * Holds all contacts which currently exist in the scene
	 *
	 * @property contact_manifolds
	 * @type Goblin.ContactManifoldList
	 */
	this.contact_manifolds = new Goblin.ContactManifoldList();
};

/**
 * Iterates over all contact manifolds, updating penetration depth & contact locations
 *
 * @method updateContactManifolds
 */
Goblin.NearPhase.prototype.updateContactManifolds = function() {
	var current = this.contact_manifolds.first,
		prev = null;

	while ( current !== null ) {
		current.update();

		// @TODO if a manifold has 0 points, remove it

		prev = current;
		current = current.next_manifold;
	}
};

/**
 * Loops over the passed array of object pairs which may be in contact
 * valid contacts are put in this object's `contacts` property
 *
 * @param possible_contacts {Array}
 */
Goblin.NearPhase.prototype.generateContacts = function( possible_contacts ) {
	var i,
		possible_contacts_length = possible_contacts.length,
		object_a,
		object_b,
		contact;

	// Free any contacts previously created
	/*for ( i = 0; i < existing_contacts_length; i++ ) {
		Goblin.ObjectPool.freeObject( 'ContactDetails', this.contacts.pop() );
	}*/

	// Make sure all of the manifolds are up to date
	this.updateContactManifolds();

	for ( i = 0; i < possible_contacts_length; i++ ) {
		object_a = possible_contacts[i][0];
		object_b = possible_contacts[i][1];

		if ( object_a.shape instanceof Goblin.SphereShape && object_b.shape instanceof Goblin.SphereShape ) {
			// Sphere - Sphere contact check
			contact = Goblin.SphereSphere( object_a, object_b );
			if ( contact != null ) {
				this.contact_manifolds.getManifoldForObjects( object_a, object_b ).addContact( contact );
			}
		} else if (
				object_a.shape instanceof Goblin.SphereShape && object_b.shape instanceof Goblin.BoxShape ||
				object_a.shape instanceof Goblin.BoxShape && object_b.shape instanceof Goblin.SphereShape
			) {
			// Sphere - Box contact check
			contact = Goblin.BoxSphere( object_a, object_b );
			if ( contact != null ) {
				this.contact_manifolds.getManifoldForObjects( object_a, object_b ).addContact( contact );
			}
		//} else if ( object_a.shape instanceof Goblin.BoxShape && object_b.shape instanceof Goblin.BoxShape ) {
		} else {
			// contact check based on GJK
			if ( (contact = Goblin.GjkEpa.GJK( object_a, object_b )) !== false ) {
				this.contact_manifolds.getManifoldForObjects( object_a, object_b ).addContact( contact );
			}
		}

		//this.updateContactManifolds();
	}
};
/**
 * Manages pools for various types of objects, provides methods for creating and freeing pooled objects
 *
 * @class ObjectPool
 * @static
 */
Goblin.ObjectPool = {
	/**
	 * Key/value map of registered types
	 *
	 * @property types
	 * @private
	 */
	types: {},

	/**
	 * Key/pool map of object type - to - object pool
	 *
	 * @property pools
	 * @private
	 */
	pools: {},

	/**
	 * Registers a type of object to be available in pools
	 *
	 * @param key {String} Key associated with the object to register
	 * @param constructing_function {Function} Function which will return a new object
	 */
	registerType: function( key, constructing_function ) {
		this.types[ key ] = constructing_function;
		this.pools[ key ] = [];
	},

	/**
	 * Retrieve a free object from the specified pool, or creates a new object if one is not available
	 *
	 * @param key {String} Key of the object type to retrieve
	 * @return {Mixed} Object of the type asked for, when done release it with `ObjectPool.freeObject`
	 */
	getObject: function( key ) {
		var pool = this.pools[ key ];

		if ( pool.length !== 0 ) {
			return pool.pop();
		} else {
			return this.types[ key ]();
		}
	},

	/**
	 * Adds on object to the object pool so it can be reused
	 *
	 * @param key {String} Type of the object being freed, matching the key given to `registerType`
	 * @param object {Mixed} object to release into the pool
	 */
	freeObject: function( key, object ) {
		this.pools[ key ].push( object );
	}
};

// register the objects used in Goblin
Goblin.ObjectPool.registerType( 'vec3', vec3.create );
Goblin.ObjectPool.registerType( 'mat3', mat3.create );
Goblin.ObjectPool.registerType( 'MassPointContact', function() { return new Goblin.MassPointContact(); } );
Goblin.ObjectPool.registerType( 'ContactDetails', function() { return new Goblin.ContactDetails(); } );
Goblin.ObjectPool.registerType( 'ContactManifold', function() { return new Goblin.ContactManifold(); } );
Goblin.ObjectPool.registerType( 'GJKSupportPoint', function() { return new Goblin.GjkEpa.SupportPoint( vec3.create(), vec3.create(), vec3.create(), vec3.create() ); } );
Goblin.ObjectPool.registerType( 'ConstraintRow', function() { return new Goblin.ConstraintRow(); } );
Goblin.ObjectPool.registerType( 'ContactConstraint', function() { return new Goblin.ContactConstraint(); } );
Goblin.ObjectPool.registerType( 'FrictionConstraint', function() { return new Goblin.FrictionConstraint(); } );
/**
 * Represents a rigid body
 *
 * @class RigidBody
 * @constructor
 * @param bounding_radius {Number} distance from the center of the object to the furthest point on the object,
 *                                 creating a bounding sphere which envelops the object
 * @param mass {Number} mass of the rigid body
 */
Goblin.RigidBody = (function() {
	var body_count = 0;

	return function( shape, mass ) {
		/**
		 * Goblin ID of the body
		 *
		 * @property id
		 * @type {Number}
		 */
		this.id = body_count++;

		/**
		 * Distance from the center of the object to the furthest point in the object,
		 * creating a bounding sphere enveloping the object
		 *
		 * @property bounding_radius
		 * @type {Number}
		 */
		this.bounding_radius = shape.getBoundingRadius();

		/**
		 * Shape definition for this rigid body
		 *
		 * @property shape
		 */
		this.shape = shape;

		/**
		 * The rigid body's mass
		 *
		 * @property mass
		 * @type {Number}
		 * @default Infinity
		 */
		this.mass = mass || Infinity;

		/**
		 * The rigid body's current position
		 *
		 * @property position
		 * @type {vec3}
		 * @default [ 0, 0, 0 ]
		 */
		this.position = vec3.create();

		/**
		 * Rotation of the rigid body
		 *
		 * @type {*}
		 */
		this.rotation = quat4.createFrom( 0, 0, 0, 1 );

		/**
		 * The rigid body's current linear velocity
		 *
		 * @property linear_velocity
		 * @type {vec3}
		 * @default [ 0, 0, 0 ]
		 */
		this.linear_velocity = vec3.create();

		/**
		 * The rigid body's current angular velocity
		 *
		 * @property angular_velocity
		 * @type {vec3}
		 * @default [ 0, 0, 0 ]
		 */
		this.angular_velocity = vec3.create();

		/**
		 * Transformation matrix transforming points from object space to world space
		 *
		 * @property transform
		 * @type {mat4}
		 */
		this.transform = mat4.identity();

		/**
		 * Transformation matrix transforming points from world space to object space
		 *
		 * @property transform_inverse
		 * @type {mat4}
		 */
		this.transform_inverse = mat4.identity();

		this.inertiaTensor = shape.getInertiaTensor( mass );

		this.inverseInertiaTensor = mat3.inverse( this.inertiaTensor );

		this.inertiaTensorWorldFrame = mat3.create();

		this.inverseInertiaTensorWorldFrame = mat3.create();

		/**
		 * The rigid body's current acceleration
		 *
		 * @property acceleration
		 * @type {vec3}
		 * @default [ 0, 0, 0 ]
		 */
		this.acceleration = vec3.create();

		/**
		 * Amount of linear damping to apply to the rigid body's velocity
		 *
		 * @property linear_damping
		 * @type {vec3}
		 * @default [ 1, 1, 1 ]
		 */
		this.linear_damping = vec3.createFrom( 1, 1, 1 );

		/**
		 * Amount of angular damping to apply to the rigid body's rotation
		 *
		 * @property angular_damping
		 * @type {vec3}
		 * @default [ 1, 1, 1 ]
		 */
		this.angular_damping = vec3.createFrom( 1, 1, 1 );

		/**
		 * Amount of restitution this object has
		 *
		 * @property restitution
		 * @type {Number}
		 * @default 0.3
		 */
		this.restitution = 0.3;

		/**
		 * Amount of friction this object has
		 *
		 * @property friction
		 * @type {Number}
		 * @default 0.5
		 */
		this.friction = 0.5;

		/**
		 * Percentage of friction ( 0.0 - 1.0 ) to apply in each direction, in local (body) frame
		 * @type {*}
		 */
		this.anisotropic_friction = vec3.createFrom( 1, 1, 1 );

		/**
		 * The rigid body's custom gravity
		 *
		 * @property gravity
		 * @type {vec3}
		 * @default null
		 * @private
		 */
		this.gravity = null;

		/**
		 * The world to which the rigid body has been added,
		 * this is set when the rigid body is added to a world
		 *
		 * @property world
		 * @type {Goblin.World}
		 * @default null
		 */
		this.world = null;

		/**
		 * All resultant force accumulated by the rigid body
		 * this force is applied in the next occurring integration
		 *
		 * @property accumulated_force
		 * @type {vec3}
		 * @default [ 0, 0, 0 ]
		 * @private
		 */
		this.accumulated_force = vec3.create();

		/**
		 * All resultant torque accumulated by the rigid body
		 * this torque is applied in the next occurring integration
		 *
		 * @property accumulated_force
		 * @type {vec3}
		 * @default [ 0, 0, 0 ]
		 * @private
		 */
		this.accumulated_torque = vec3.create();

		this.push_velocity = vec3.create();
		this.turn_velocity = vec3.create();

		// Used by the constraint solver to determine what impulse needs to be added to the body
		this.solver_impulse = new Float64Array( 6 );

		// Set default derived values
		this.updateDerived();
	};
})();

/**
 * Given `direction`, find the point in this body which is the most extreme in that direction.
 * This support point is calculated in world coordinates and stored in the second parameter `support_point`
 *
 * @method findSupportPoint
 * @param direction {vec3} direction to use in finding the support point
 * @param support_point {vec3} vec3 variable which will contain the supporting point after calling this method
 */
Goblin.RigidBody.prototype.findSupportPoint = function( direction, support_point ) {
	this.shape.findSupportPoint( this.rotation, this.transform, direction, support_point );
};

/**
 * Updates the rigid body's position, velocity, and acceleration
 *
 * @method integrate
 * @param duration {Number} time, in seconds, to use in integration
 */
Goblin.RigidBody.prototype.integrate = function( duration ) {
	if ( this.mass === Infinity ) {
		return;
	}

	var _vec3_1 = _tmp_vec3_1,
		_vec3_2 = _tmp_vec3_2;

	// Add accumulated forces
	vec3.set( this.accumulated_force, _vec3_1 );
	vec3.scale( _vec3_1, 1 / this.mass );

	/* Update linear velocity from the acceleration. */
	vec3.add( this.linear_velocity, _vec3_1 );


	// Calculate angular acceleration from torque inputs.
	vec3.set( this.accumulated_torque, _vec3_1 );
	mat3.multiplyVec3( this.inverseInertiaTensorWorldFrame, _vec3_1 );

	// Update angular velocity from both acceleration and impulse.
	vec3.scale( _vec3_1, duration );
	vec3.add( this.angular_velocity, _vec3_1 );


	/* Apply damping*/
	vec3.multiply( this.linear_velocity, this.linear_damping );
	vec3.multiply( this.angular_velocity, this.angular_damping );


	/* Update linear position*/
	// Simpler, but not quite as accurate as the following method
	// as it does add the additional velocity caused by acceleration
	vec3.set( this.linear_velocity, _vec3_1 );
	vec3.scale( _vec3_1, duration );
	vec3.add( this.position, _vec3_1 );

	// Apply angular velocity
	_tmp_quat4_1[0] = this.angular_velocity[0];
	_tmp_quat4_1[1] = this.angular_velocity[1];
	_tmp_quat4_1[2] = this.angular_velocity[2];
	_tmp_quat4_1[3] = 0;

	quat4.multiply( _tmp_quat4_1, this.rotation );

	var half_dt = duration * 0.5;
	this.rotation[0] += half_dt * _tmp_quat4_1[0];
	this.rotation[1] += half_dt * _tmp_quat4_1[1];
	this.rotation[2] += half_dt * _tmp_quat4_1[2];
	this.rotation[3] += half_dt * _tmp_quat4_1[3];
	//quat4.addScaledVector( this.rotation, this.angular_velocity, duration );
	quat4.normalize( this.rotation );

	// Clear accumulated forces
	this.accumulated_force[0] = this.accumulated_force[1] = this.accumulated_force[2] = 0;
	this.accumulated_torque[0] = this.accumulated_torque[1] = this.accumulated_torque[2] = 0;
	this.solver_impulse[0] = this.solver_impulse[1] = this.solver_impulse[2] = this.solver_impulse[3] = this.solver_impulse[4] = this.solver_impulse[5] = 0;
};

/**
 * Sets a custom gravity value for this rigid_body
 *
 * @method setGravity
 * @param x {Number} gravity to apply on x axis
 * @param y {Number} gravity to apply on y axis
 * @param z {Number} gravity to apply on z axis
 */
Goblin.RigidBody.prototype.setGravity = function( x, y, z ) {
	if ( this.gravity ) {
		this.gravity[0] = x;
		this.gravity[1] = y;
		this.gravity[2] = z;
	} else {
		this.gravity = vec3.createFrom( x, y, z );
	}
};

/**
 * Adds a force to the rigid_body which will be used only for the next integration
 *
 * @method applyForce
 * @param force {vec3} force to apply to the rigid_body
 */
Goblin.RigidBody.prototype.applyForce = function( force ) {
	vec3.add( this.accumulated_force, force );
};

/**
 * Applies the vector `force` at world coordinate `point`
 *
 * @method applyForceAtWorldPoint
 * @param force {vec3} Force to apply
 * @param point {vec3} world coordinates where force originates
 */
Goblin.RigidBody.prototype.applyForceAtWorldPoint = function( force, point ) {
	// @TODO support for moving center of mass
	var _vec3 = _tmp_vec3_1;
	vec3.set( point, _vec3 );
	vec3.subtract( _vec3, this.position );
	vec3.cross( _vec3, force );

	vec3.add( this.accumulated_force, force );
	vec3.add( this.accumulated_torque, _vec3 );
};

/**
 * Applies vector `force` to body at position `point` in body's frame
 *
 * @method applyForceAtLocalPoint
 * @param force {vec3} Force to apply
 * @param point {vec3} local frame coordinates where force originates
 */
Goblin.RigidBody.prototype.applyForceAtLocalPoint = function( force, point ) {
	var _vec3 = _tmp_vec3_1;
	mat4.multiplyVec3( this.transform, point, _vec3 );
	this.applyForceAtWorldPoint( force, _vec3 );
};

/**
 * Sets the rigid body's transformation matrix to the current position and rotation
 *
 * @method updateDerived
 */
Goblin.RigidBody.prototype.updateDerived = function() {
	// normalize rotation
	quat4.normalize( this.rotation );

	// update this.transform and this.transform_inverse
	mat4.fromRotationTranslation( this.rotation, this.position, this.transform );
	mat4.inverse( this.transform, this.transform_inverse );

	// update this.inverseInertiaTensorWorldFrame
	if ( this.mass !== Infinity ) {
		this.updateInverseInertiaTensorWorldFrame();
	}
};

Goblin.RigidBody.prototype.updateInverseInertiaTensorWorldFrame = function() {
	var rotmat = this.transform,
		iitWorld = this.inverseInertiaTensorWorldFrame,
		iitBody = this.inverseInertiaTensor,
		q = this.rotation;

	var t4 = rotmat[0]*iitBody[0]+
		rotmat[1]*iitBody[3]+
		rotmat[2]*iitBody[6];
	var t9 = rotmat[0]*iitBody[1]+
		rotmat[1]*iitBody[4]+
		rotmat[2]*iitBody[7];
	var t14 = rotmat[0]*iitBody[2]+
		rotmat[1]*iitBody[5]+
		rotmat[2]*iitBody[8];
	var t28 = rotmat[4]*iitBody[0]+
		rotmat[5]*iitBody[3]+
		rotmat[6]*iitBody[6];
	var t33 = rotmat[4]*iitBody[1]+
		rotmat[5]*iitBody[4]+
		rotmat[6]*iitBody[7];
	var t38 = rotmat[4]*iitBody[2]+
		rotmat[5]*iitBody[5]+
		rotmat[6]*iitBody[8];
	var t52 = rotmat[8]*iitBody[0]+
		rotmat[9]*iitBody[3]+
		rotmat[10]*iitBody[6];
	var t57 = rotmat[8]*iitBody[1]+
		rotmat[9]*iitBody[4]+
		rotmat[10]*iitBody[7];
	var t62 = rotmat[8]*iitBody[2]+
		rotmat[9]*iitBody[5]+
		rotmat[10]*iitBody[8];
	iitWorld[0] = t4*rotmat[0]+
		t9*rotmat[1]+
		t14*rotmat[2];
	iitWorld[1] = t4*rotmat[4]+
		t9*rotmat[5]+
		t14*rotmat[6];
	iitWorld[2] = t4*rotmat[8]+
		t9*rotmat[9]+
		t14*rotmat[10];
	iitWorld[3] = t28*rotmat[0]+
		t33*rotmat[1]+
		t38*rotmat[2];
	iitWorld[4] = t28*rotmat[4]+
		t33*rotmat[5]+
		t38*rotmat[6];
	iitWorld[5] = t28*rotmat[8]+
		t33*rotmat[9]+
		t38*rotmat[10];
	iitWorld[6] = t52*rotmat[0]+
		t57*rotmat[1]+
		t62*rotmat[2];
	iitWorld[7] = t52*rotmat[4]+
		t57*rotmat[5]+
		t62*rotmat[6];
	iitWorld[8] = t52*rotmat[8]+
		t57*rotmat[9]+
		t62*rotmat[10];

	mat3.inverse( this.inverseInertiaTensorWorldFrame, this.inertiaTensorWorldFrame );
};
/**
 * Adapted from BulletPhysics's btSequentialImpulseSolver
 *
 * @class SequentialImpulseSolver
 * @constructor
 */
Goblin.SequentialImpulseSolver = function() {
	/**
	 * Holds contact constraints generated from contact manifolds
	 *
	 * @param contact_constraints
	 * @type {Array}
	 */
	this.contact_constraints = [];

	/**
	 * Holds friction constraints generated from contact manifolds
	 *
	 * @param friction_constraints
	 * @type {Array}
	 */
	this.friction_constraints = [];

	// All constraints being processed
	this.constraints = [];

	// Velocity constraints
	this.C = [];

	// Constraint forces
	this.Fc = [];

	/**
	 * Configuration dictionary
	 *
	 * @submodule SequentialImpulseSolverConfig
	 * @static
	 */
	this.config = {

	};
};

/**
 * Converts contact manifolds into contact constraints
 *
 * @method processContactManifolds
 * @param contact_manifolds {Array} contact manifolds to process
 */
Goblin.SequentialImpulseSolver.prototype.processContactManifolds = function( contact_manifolds, time_step ) {
	var i, j,
		manifold,
		contacts_length,
		contact,
		constraint;

	this.contact_constraints.length = 0;
	this.friction_constraints.length = 0;

	manifold = contact_manifolds.first;

	i = 0;
	while( manifold ) {
		i++;
		//if ( i >= 1 ) window.stop = true;
		contacts_length = manifold.points.length;

		for ( j = 0; j < contacts_length; j++ ) {
			contact = manifold.points[j];

			if ( contact.penetration_depth >= 0 ) {
				// Build contact constraint
				constraint = Goblin.ObjectPool.getObject( 'ContactConstraint' );
				constraint.buildFromContact( contact );
				this.contact_constraints.push( constraint );

				// Build friction constraint
				constraint = Goblin.ObjectPool.getObject( 'FrictionConstraint' );
				constraint.buildFromContact( contact );
				this.friction_constraints.push( constraint );
			}
		}

		manifold = manifold.next_manifold;
	}
};

Goblin.SequentialImpulseSolver.prototype.solve = function( time_delta ) {
	// @TODO just for now
	this.constraints = [];
	Array.prototype.push.apply( this.constraints, this.contact_constraints );
	Array.prototype.push.apply( this.constraints, this.friction_constraints );

	var num_constraints = this.constraints.length,
		constraint,
		num_rows,
		row,
		i, j,
		invmass;

	// Prepare the constraints
	for ( i = 0; i < num_constraints; i++ ) {
		constraint = this.constraints[i];
		num_rows = constraint.rows.length;

		for ( j = 0; j < num_rows; j++ ) {
			row = constraint.rows[j];

			row.multiplier = 0;
			row.applied_push_impulse = 0;

			// Compute inverse terms
			if ( constraint.object_a != null && constraint.object_a.mass !== Infinity ) {
				invmass = 1 / constraint.object_a.mass;
				row.B[0] = invmass * row.jacobian[0];
				row.B[1] = invmass * row.jacobian[1];
				row.B[2] = invmass * row.jacobian[2];

				_tmp_vec3_1[0] = row.jacobian[3];
				_tmp_vec3_1[1] = row.jacobian[4];
				_tmp_vec3_1[2] = row.jacobian[5];
				mat3.multiplyVec3( constraint.object_a.inverseInertiaTensorWorldFrame, _tmp_vec3_1 );
				row.B[3] = _tmp_vec3_1[0];
				row.B[4] = _tmp_vec3_1[1];
				row.B[5] = _tmp_vec3_1[2];
			} else {
				row.B[0] = row.B[1] = row.B[2] = 0;
				row.B[3] = row.B[4] = row.B[5] = 0;
			}

			if ( constraint.object_b != null && constraint.object_b.mass !== Infinity ) {
				invmass = 1 / constraint.object_b.mass;
				row.B[6] = invmass * row.jacobian[6];
				row.B[7] = invmass * row.jacobian[7];
				row.B[8] = invmass * row.jacobian[8];

				_tmp_vec3_1[0] = row.jacobian[9];
				_tmp_vec3_1[1] = row.jacobian[10];
				_tmp_vec3_1[2] = row.jacobian[11];
				mat3.multiplyVec3( constraint.object_b.inverseInertiaTensorWorldFrame, _tmp_vec3_1 );
				row.B[9] = _tmp_vec3_1[0];
				row.B[10] = _tmp_vec3_1[1];
				row.B[11] = _tmp_vec3_1[2];
			} else {
				row.B[6] = row.B[7] = row.B[8] = 0;
				row.B[9] = row.B[10] = row.B[11] = 0;
			}

			// Compute `D`
			row.D = 0;
			if ( constraint.object_a != null ) {
				row.D += row.jacobian[0] * row.B[0] +
								   row.jacobian[1] * row.B[1] +
								   row.jacobian[2] * row.B[2] +
								   row.jacobian[3] * row.B[3] +
								   row.jacobian[4] * row.B[4] +
								   row.jacobian[5] * row.B[5];
			}
			if ( constraint.object_b != null ) {
				row.D += row.jacobian[6] * row.B[6] +
								   row.jacobian[7] * row.B[7] +
								   row.jacobian[8] * row.B[8] +
								   row.jacobian[9] * row.B[9] +
								   row.jacobian[10] * row.B[10] +
								   row.jacobian[11] * row.B[11];
			}
			if ( row.D === 0 ) {
				// @TODO this really shouldn't be possible, and introduces NaNs
				row.D = 1;
			}

			// Compute `eta` - the amount of work needed this tick
			var invdelta = 1 / time_delta,
				tick_bias = row.bias,
				eta_row = new Float64Array( 12 );
			if ( constraint.object_a != null ) {
				// Compute linear distance traveling this tick
				invmass = 1 / constraint.object_a.mass;
				eta_row[0] = ( constraint.object_a.linear_velocity[0] + ( invmass * constraint.object_a.accumulated_force[0] ) );
				eta_row[1] = ( constraint.object_a.linear_velocity[1] + ( invmass * constraint.object_a.accumulated_force[1] ) );
				eta_row[2] = ( constraint.object_a.linear_velocity[2] + ( invmass * constraint.object_a.accumulated_force[2] ) );

				// Compute angular distance traveling this tick
				_tmp_vec3_1[0] = constraint.object_a.accumulated_torque[0];
				_tmp_vec3_1[1] = constraint.object_a.accumulated_torque[1];
				_tmp_vec3_1[2] = constraint.object_a.accumulated_torque[2];
				mat3.multiplyVec3( constraint.object_a.inverseInertiaTensorWorldFrame, _tmp_vec3_1 );
				eta_row[3] = ( constraint.object_a.angular_velocity[0] + ( _tmp_vec3_1[0] ) );
				eta_row[4] = ( constraint.object_a.angular_velocity[1] + ( _tmp_vec3_1[1] ) );
				eta_row[5] = ( constraint.object_a.angular_velocity[2] + ( _tmp_vec3_1[2] ) );
			} else {
				eta_row[0] = eta_row[1] = eta_row[2] = eta_row[3] = eta_row[4] = eta_row[5] = 0;
			}
			if ( constraint.object_b != null ) {
				invmass = 1 / constraint.object_b.mass;
				eta_row[6] = ( constraint.object_b.linear_velocity[0] + ( invmass * constraint.object_b.accumulated_force[0] ) );
				eta_row[7] = ( constraint.object_b.linear_velocity[1] + ( invmass * constraint.object_b.accumulated_force[1] ) );
				eta_row[8] = ( constraint.object_b.linear_velocity[2] + ( invmass * constraint.object_b.accumulated_force[2] ) );

				// Compute angular distance traveling this tick
				_tmp_vec3_1[0] = constraint.object_b.accumulated_torque[0];
				_tmp_vec3_1[1] = constraint.object_b.accumulated_torque[1];
				_tmp_vec3_1[2] = constraint.object_b.accumulated_torque[2];
				mat3.multiplyVec3( constraint.object_b.inverseInertiaTensorWorldFrame, _tmp_vec3_1 );
				eta_row[9] = ( constraint.object_b.angular_velocity[0] + ( _tmp_vec3_1[0] ) );
				eta_row[10] = ( constraint.object_b.angular_velocity[1] + ( _tmp_vec3_1[1] ) );
				eta_row[11] = ( constraint.object_b.angular_velocity[2] + ( _tmp_vec3_1[2] ) );
			} else {
				eta_row[6] = eta_row[7] = eta_row[8] = eta_row[9] = eta_row[10] = eta_row[11] = 0;
			}

			var jdotv = row.jacobian[0] * eta_row[0] +
						row.jacobian[1] * eta_row[1] +
						row.jacobian[2] * eta_row[2] +
						row.jacobian[3] * eta_row[3] +
						row.jacobian[4] * eta_row[4] +
						row.jacobian[5] * eta_row[5] +
						row.jacobian[6] * eta_row[6] +
						row.jacobian[7] * eta_row[7] +
						row.jacobian[8] * eta_row[8] +
						row.jacobian[9] * eta_row[9] +
						row.jacobian[10] * eta_row[10] +
						row.jacobian[11] * eta_row[11];
			row.eta = ( tick_bias - jdotv );

			//@TODO precompute a=BL
			row.multiplier = row.multiplier_cache = 0;
		}
	}

	var max_iterations = 10,
		iteration = 0,
		delta_lambda;

	// Solve penetrations
	for ( iteration = 0; iteration < max_iterations; iteration++ ) {
		for ( i = 0; i < this.contact_constraints.length; i++ ) {
			constraint = this.contact_constraints[i];
			row = constraint.rows[0];

			var delta_impulse = constraint.contact.penetration_depth - row.applied_push_impulse;


			_tmp_vec3_1[0] = row.jacobian[0];
			_tmp_vec3_1[1] = row.jacobian[1];
			_tmp_vec3_1[2] = row.jacobian[2];
			_tmp_vec3_2[0] = row.jacobian[3];
			_tmp_vec3_2[1] = row.jacobian[4];
			_tmp_vec3_2[2] = row.jacobian[5];
			var delta_vel1_dot_n = vec3.dot( _tmp_vec3_1, constraint.object_a.push_velocity ) +
								   vec3.dot( _tmp_vec3_2, constraint.object_a.turn_velocity );

			_tmp_vec3_1[0] = row.jacobian[6];
			_tmp_vec3_1[1] = row.jacobian[7];
			_tmp_vec3_1[2] = row.jacobian[8];
			_tmp_vec3_2[0] = row.jacobian[9];
			_tmp_vec3_2[1] = row.jacobian[10];
			_tmp_vec3_2[2] = row.jacobian[11];
			var delta_vel2_dot_n = vec3.dot( _tmp_vec3_1, constraint.object_b.push_velocity ) +
								   vec3.dot( _tmp_vec3_2, constraint.object_b.turn_velocity );

			//console.debug( delta_vel1_dot_n, delta_vel2_dot_n );

			delta_impulse -= delta_vel1_dot_n;
			delta_impulse -= delta_vel2_dot_n;
			delta_impulse /= row.D;

			//console.debug( delta_impulse );

			var sum = row.applied_push_impulse + delta_impulse;
			if (sum < row.lower_limit) {
				delta_impulse = row.lower_limit - row.applied_push_impulse;
				row.applied_push_impulse = row.lower_limit;
			} else {
				row.applied_push_impulse = sum;
			}

			constraint.object_a.push_velocity[0] += row.B[0] * delta_impulse * constraint.object_a.linear_damping[0];
			constraint.object_a.push_velocity[1] += row.B[1] * delta_impulse * constraint.object_a.linear_damping[1];
			constraint.object_a.push_velocity[2] += row.B[2] * delta_impulse * constraint.object_a.linear_damping[2];
			constraint.object_a.turn_velocity[0] += row.B[3] * delta_impulse * constraint.object_a.angular_damping[0];
			constraint.object_a.turn_velocity[1] += row.B[4] * delta_impulse * constraint.object_a.angular_damping[1];
			constraint.object_a.turn_velocity[2] += row.B[5] * delta_impulse * constraint.object_a.angular_damping[2];


			constraint.object_b.push_velocity[0] += row.B[6] * delta_impulse * constraint.object_b.linear_damping[0];
			constraint.object_b.push_velocity[1] += row.B[7] * delta_impulse * constraint.object_b.linear_damping[1];
			constraint.object_b.push_velocity[2] += row.B[8] * delta_impulse * constraint.object_b.linear_damping[2];
			constraint.object_b.turn_velocity[0] += row.B[9] * delta_impulse * constraint.object_b.angular_damping[0];
			constraint.object_b.turn_velocity[1] += row.B[10] * delta_impulse * constraint.object_b.angular_damping[1];
			constraint.object_b.turn_velocity[2] += row.B[11] * delta_impulse * constraint.object_b.angular_damping[2];
		}
	}

	// Apply position/rotation solver
	for ( i = 0; i < this.contact_constraints.length; i++ ) {
		constraint = this.contact_constraints[i];
		row = constraint.rows[0];

		/*vec3.scale( constraint.object_a.turn_velocity, 1, _tmp_vec3_1 ); // Apply ERP to angular velocity

		var axis = vec3.create(),
			fAngle = vec3.length( _tmp_vec3_1 );

		//limit the angular motion
		var ANGULAR_MOTION_THRESHOLD = 0.25 * Math.PI;
		if ( fAngle * time_delta > ANGULAR_MOTION_THRESHOLD ) {
			fAngle = ANGULAR_MOTION_THRESHOLD / time_delta;
		}

		if ( fAngle < 0.001 )
		{
			// use Taylor's expansions of sync function
			vec3.scale(
				_tmp_vec3_1,
				0.5 * time_delta -
				( time_delta * time_delta * time_delta) *
				( 0.020833333333 ) * fAngle * fAngle,
				axis
			);
		}
		else
		{
			vec3.scale(
				_tmp_vec3_1,
				Math.sin( 0.5 * fAngle * time_delta ) / fAngle,
				axis
			);
		}

		var dorn = quat4.createFrom( axis[0], axis[1], axis[2], Math.cos( fAngle * time_delta * 0.5 ) );

		quat4.multiply( dorn, constraint.object_a.rotation, constraint.object_a.rotation );
		quat4.normalize( constraint.object_a.rotation );*/

		//vec3.scale( constraint.object_a.push_velocity, 0.2 );
		//vec3.scale( constraint.object_a.turn_velocity, 0.1 );
		//console.debug( constraint.object_a.push_velocity[0], constraint.object_a.push_velocity[1], constraint.object_a.push_velocity[2] );
		vec3.add( constraint.object_a.position, constraint.object_a.push_velocity );
		vec3.add( constraint.object_a.angular_velocity, constraint.object_a.turn_velocity );
		constraint.object_a.push_velocity[0] = constraint.object_a.push_velocity[1] = constraint.object_a.push_velocity[2] = 0;
		constraint.object_a.turn_velocity[0] = constraint.object_a.turn_velocity[1] = constraint.object_a.turn_velocity[2] = 0;

		//vec3.scale( constraint.object_b.push_velocity, 0.5 );
		//vec3.scale( constraint.object_b.turn_velocity, 0.2 );
		vec3.add( constraint.object_b.position, constraint.object_b.push_velocity );
		vec3.add( constraint.object_b.angular_velocity, constraint.object_b.turn_velocity );
		constraint.object_b.push_velocity[0] = constraint.object_b.push_velocity[1] = constraint.object_b.push_velocity[2] = 0;
		constraint.object_b.turn_velocity[0] = constraint.object_b.turn_velocity[1] = constraint.object_b.turn_velocity[2] = 0;
	}

	// Solve impulses
	for ( iteration = 0; iteration < max_iterations; iteration++ ) {
		for ( i = 0; i < num_constraints; i++ ) {
			constraint = this.constraints[i];

			num_rows = constraint.rows.length;
			for ( j = 0; j < num_rows; j++ ) {

				row = constraint.rows[j];

				var dot1 = row.jacobian[0] * constraint.object_a.solver_impulse[0] +
						   row.jacobian[1] * constraint.object_a.solver_impulse[1] +
						   row.jacobian[2] * constraint.object_a.solver_impulse[2] +
						   row.jacobian[3] * constraint.object_a.solver_impulse[3] +
						   row.jacobian[4] * constraint.object_a.solver_impulse[4] +
						   row.jacobian[5] * constraint.object_a.solver_impulse[5];
				var dot2 = row.jacobian[6] * constraint.object_b.solver_impulse[0] +
						   row.jacobian[7] * constraint.object_b.solver_impulse[1] +
						   row.jacobian[8] * constraint.object_b.solver_impulse[2] +
						   row.jacobian[9] * constraint.object_b.solver_impulse[3] +
						   row.jacobian[10] * constraint.object_b.solver_impulse[4] +
						   row.jacobian[11] * constraint.object_b.solver_impulse[5];

				delta_lambda = ( row.eta - dot1 - dot2 ) / row.D;

				row.multiplier_cache = row.multiplier;
				row.multiplier = Math.max(
					row.lower_limit,
					Math.min(
						row.multiplier_cache + delta_lambda,
						row.upper_limit
					)
				);
				delta_lambda = row.multiplier - row.multiplier_cache;

				constraint.object_a.solver_impulse[0] += delta_lambda * row.B[0];
				constraint.object_a.solver_impulse[1] += delta_lambda * row.B[1];
				constraint.object_a.solver_impulse[2] += delta_lambda * row.B[2];
				constraint.object_a.solver_impulse[3] += delta_lambda * row.B[3];
				constraint.object_a.solver_impulse[4] += delta_lambda * row.B[4];
				constraint.object_a.solver_impulse[5] += delta_lambda * row.B[5];
				constraint.object_b.solver_impulse[0] += delta_lambda * row.B[6];
				constraint.object_b.solver_impulse[1] += delta_lambda * row.B[7];
				constraint.object_b.solver_impulse[2] += delta_lambda * row.B[8];
				constraint.object_b.solver_impulse[3] += delta_lambda * row.B[9];
				constraint.object_b.solver_impulse[4] += delta_lambda * row.B[10];
				constraint.object_b.solver_impulse[5] += delta_lambda * row.B[11];

			}
		}
	}
};

Goblin.SequentialImpulseSolver.prototype.apply = function( time_delta ) {
	var num_constraints = this.constraints.length,
		constraint,
		num_rows,
		row,
		i, j,
		multiplier;

	for ( i = 0; i < num_constraints; i++ ) {
		constraint = this.constraints[i];
		num_rows = constraint.rows.length;

		for ( j = 0; j < num_rows; j++ ) {
			row = constraint.rows[j];
			multiplier = row.multiplier;

			if ( constraint.object_a.mass !== Infinity ) {
				_tmp_vec3_1[0] = row.B[0] * multiplier;
				_tmp_vec3_1[1] = row.B[1] * multiplier;
				_tmp_vec3_1[2] = row.B[2] * multiplier;
				//vec3.scale( _tmp_vec3_1, row.object_a.mass );
				//vec3.add( constraint.object_a.accumulated_force, _tmp_vec3_1 );
				//console.debug( _tmp_vec3_1[0], _tmp_vec3_1[1], _tmp_vec3_1[2] );
				vec3.add( constraint.object_a.linear_velocity, _tmp_vec3_1 );

				_tmp_vec3_1[0] = row.B[3] * multiplier;
				_tmp_vec3_1[1] = row.B[4] * multiplier;
				_tmp_vec3_1[2] = row.B[5] * multiplier;
				//mat3.multiplyVec3( constraint.object_a.inertiaTensorWorldFrame, _tmp_vec3_1 );
				//vec3.add( constraint.object_a.accumulated_torque, _tmp_vec3_1 );
				//vec3.scale( _tmp_vec3_1, 60 );
				//console.debug( _tmp_vec3_1[0], _tmp_vec3_1[1], _tmp_vec3_1[2] );
				vec3.add( constraint.object_a.angular_velocity, _tmp_vec3_1 );
			}

			if ( constraint.object_b.mass !== Infinity ) {
				_tmp_vec3_1[0] = row.B[6] * multiplier;
				_tmp_vec3_1[1] = row.B[7] * multiplier;
				_tmp_vec3_1[2] = row.B[8] * multiplier;
				/*vec3.scale( _tmp_vec3_1, constraint.object_b.mass );
				vec3.add( constraint.object_b.accumulated_force, _tmp_vec3_1 );*/
				vec3.add( constraint.object_b.linear_velocity, _tmp_vec3_1 );

				_tmp_vec3_1[0] = row.B[9] * multiplier;
				_tmp_vec3_1[1] = row.B[10] * multiplier;
				_tmp_vec3_1[2] = row.B[11] * multiplier;
				/*mat3.multiplyVec3( constraint.object_a.inertiaTensorWorldFrame, _tmp_vec3_1 );
				vec3.add( constraint.object_b.accumulated_torque, _tmp_vec3_1 );*/
				vec3.add( constraint.object_b.angular_velocity, _tmp_vec3_1 );
			}
		}
	}
};

/**
 * Applies a body's anisotropic friction
 *
 * @method applyAnisotropicFriction
 * @param object
 * @param friction_direction
 * @static
 * @private
 */
Goblin.SequentialImpulseSolver.applyAnisotropicFriction = function( object, friction_direction ) {
	var anisotropic_friction = object.anisotropic_friction;

	if ( anisotropic_friction[0] === anisotropic_friction[1] === anisotropic_friction[2] === 1.0 ) {
		// @TODO transform `anisotropic_friction` to world coordinates and apply to avoid two transforms

		// transform to local coordinates
		mat4.multiplyVec3( object.transform_inverse, friction_direction, _tmp_vec3_1 );

		//apply anisotropic friction
		vec3.multiply( _tmp_vec3_1, anisotropic_friction );

		// ... and transform it back to global coordinates
		mat4.multiplyVec( object.transform, _tmp_vec3_1, friction_direction );
	}
};
/**
 * @class BoxShape
 * @param half_width {Number} half width of the cube ( X axis )
 * @param half_height {Number} half height of the cube ( Y axis )
 * @param half_depth {Number} half depth of the cube ( Z axis )
 * @constructor
 */
Goblin.BoxShape = function( half_width, half_height, half_depth ) {
	/**
	 * Half width of the cube ( X axis )
	 *
	 * @proptery half_width
	 * @type {Number}
	 */
	this.half_width = half_width;

	/**
	 * Half height of the cube ( Y axis )
	 *
	 * @proptery half_height
	 * @type {Number}
	 */
	this.half_height = half_height;

	/**
	 * Half width of the cube ( Z axis )
	 *
	 * @proptery half_height
	 * @type {Number}
	 */
	this.half_depth = half_depth;
};

Goblin.BoxShape.prototype.getBoundingRadius = function() {
	return Math.max( this.half_width, this.half_height, this.half_depth ) * 1.7320508075688772; // largest half-axis * sqrt(3);
};

Goblin.BoxShape.prototype.getInertiaTensor = function( mass ) {
	var height_squared = this.half_height * this.half_height * 4,
		width_squared = this.half_width * this.half_width * 4,
		depth_squared = this.half_depth * this.half_depth * 4,
		element = 0.0833 * mass;
	return mat3.createFrom(
		element * ( height_squared + depth_squared ), 0, 0,
		0, element * ( width_squared + depth_squared ), 0,
		0, 0, element * ( height_squared + width_squared )
	);
};

/**
 * Given `direction`, find the point in this body which is the most extreme in that direction.
 * This support point is calculated in world coordinates and stored in the second parameter `support_point`
 *
 * @method findSupportPoint
 * @param direction {vec3} direction to use in finding the support point
 * @param support_point {vec3} vec3 variable which will contain the supporting point after calling this method
 */
Goblin.BoxShape.prototype.findSupportPoint = function( rotation, transform, direction, support_point ) {
	var localized_direction = _tmp_vec3_1,
		world_to_local_rotation_transform = _tmp_quat4_1;

	// First transform the direction vector into the body's local frame
	quat4.inverse( rotation, world_to_local_rotation_transform );
	quat4.multiplyVec3( world_to_local_rotation_transform, direction, localized_direction );

	/*
	support_point = [
		 sign( direction.x ) * half_width,
		 sign( direction.y ) * half_height,
		 sign( direction.z ) * half_depth
	]
	*/

	// Calculate the support point in the local frame
	if ( localized_direction[0] < 0 ) {
		support_point[0] = -this.half_width;
	} else {
		support_point[0] = this.half_width;
	}

	if ( localized_direction[1] < 0 ) {
		support_point[1] = -this.half_height;
	} else {
		support_point[1] = this.half_height;
	}

	if ( localized_direction[2] < 0 ) {
		support_point[2] = -this.half_depth;
	} else {
		support_point[2] = this.half_depth;
	}

	// Transform the localized support point into world coordinates
	mat4.multiplyVec3( transform, support_point );
};
/**
 * @class SphereShape
 * @param radius {Number} sphere radius
 * @constructor
 */
Goblin.SphereShape = function( radius ) {
	this.radius = radius;
};

Goblin.SphereShape.prototype.getBoundingRadius = function() {
	return this.radius;
};

Goblin.SphereShape.prototype.getInertiaTensor = function( mass ) {
	var element = 0.4 * mass * this.radius * this.radius;
	return mat3.createFrom(
		element, 0, 0,
		0, element, 0,
		0, 0, element
	);
};

/**
 * Given `direction`, find the point in this body which is the most extreme in that direction.
 * This support point is calculated in world coordinates and stored in the second parameter `support_point`
 *
 * @method findSupportPoint
 * @param direction {vec3} direction to use in finding the support point
 * @param support_point {vec3} vec3 variable which will contain the supporting point after calling this method
 */
Goblin.SphereShape.prototype.findSupportPoint = function( rotation, transform, direction, support_point ) {
	var localized_direction = _tmp_vec3_1,
		world_to_local_rotation_transform = _tmp_quat4_1;

	// @TODO shouldn't need to transform the search direction first, but rather align the support point with the search direction after it has been calculated

	// First transform the direction vector into the body's local frame
	quat4.inverse( rotation, world_to_local_rotation_transform );
	quat4.multiplyVec3( world_to_local_rotation_transform, direction, localized_direction );
	/*
	 support_point = radius * (normalized)direction
	*/

	//vec3.normalize( direction, localized_direction );
	vec3.normalize( localized_direction );
	vec3.scale( localized_direction, this.radius, support_point );

	// Transform the localized support point into world coordinates
	mat4.multiplyVec3( transform, support_point );
};
/**
 * Manages the physics simulation
 *
 * @class World
 * @param broadphase {Goblin.Broadphase} the broadphase used by the world to find possible contacts
 * @param nearphase {Goblin.NearPhase} the nearphase used by the world to generate valid contacts
 * @constructor
 */
Goblin.World = function( broadphase, nearphase, solver ) {
	/**
	 * The broadphase used by the world to find possible contacts
	 *
	 * @property broadphase
	 * @type {Goblin.Broadphase}
	 */
	this.broadphase = broadphase;

	/**
	 * The nearphase used by the world to generate valid contacts
	 *
	 * @property nearphasee
	 * @type {Goblin.NearPhase}
	 */
	this.nearphase = nearphase;

	/**
	 * The contact solver used by the world to calculate and apply impulses resulting from contacts
	 *
	 * @property solver
	 */
	this.solver = solver;

	/**
	 * Array of mass_points in the world
	 *
	 * @property mass_points
	 * @type {Array}
	 * @default []
	 * @private
	 */
	this.mass_points = [];

	/**
	 * Array of rigid_bodies in the world
	 *
	 * @property rigid_bodies
	 * @type {Array}
	 * @default []
	 * @private
	 */
	this.rigid_bodies = [];

	/**
	* the world's gravity, applied by default to all objects in the world
	*
	* @property gravity
	* @type {vec3}
	* @default [ 0, -9.8, 0 ]
	*/
	this.gravity = vec3.createFrom( 0, -9.8, 0 );

	/**
	 * array of force generators in the world
	 *
	 * @property force_generators
	 * @type {Array}
	 * @default []
	 * @private
	 */
	this.force_generators = [];

	/**
	 * array of constraints in the world
	 *
	 * @property constraints
	 * @type {Array}
	 * @default []
	 * @private
	 */
	this.constraints = [];

	/**
	 * @property contacts
	 * @type {Array}
	 */
	this.contacts = [];
};
/**
* Steps the physics simulation according to the time delta
*
* @method step
* @param time_delta {Number} amount of time to simulate, in seconds
*/
Goblin.World.prototype.step = function( time_delta ) {
	var i, loop_count, body;

	for ( i = 0, loop_count = this.rigid_bodies.length; i < loop_count; i++ ) {
		this.rigid_bodies[i].updateDerived();
	}

	// Apply gravity
	for ( i = 0, loop_count = this.rigid_bodies.length; i < loop_count; i++ ) {
		body = this.rigid_bodies[i];

		// Objects of infinite mass don't move
		if ( body.mass !== Infinity ) {
			vec3.scale( body.gravity || this.gravity, body.mass * time_delta, _tmp_vec3_1 );
			vec3.add( body.accumulated_force, _tmp_vec3_1 );
		}
	}

	// Apply force generators
	for ( i = 0, loop_count = this.force_generators.length; i < loop_count; i++ ) {
		this.force_generators[i].applyForce();
	}

	// Check for contacts, broadphase
	this.broadphase.predictContactPairs();

	// Find valid contacts, nearphase
	this.nearphase.generateContacts( this.broadphase.collision_pairs );

	// Process contact manifolds into contact and friction constraints
	this.solver.processContactManifolds( this.nearphase.contact_manifolds, time_delta );

	// Run the constraint solver
	this.solver.solve( time_delta );

	// Apply the constraints
	this.solver.apply( time_delta );

	// Integrate rigid bodies
	for ( i = 0, loop_count = this.rigid_bodies.length; i < loop_count; i++ ) {
		body = this.rigid_bodies[i];
		body.integrate( time_delta );
	}
};
/**
 * Adds a mass point to the world
 *
 * @method addMassPoint
 * @param mass_point {Goblin.MassPoint} mass point to add to the world
 */
Goblin.World.prototype.addMassPoint = function( mass_point ) {
	mass_point.world = this;
	this.mass_points.push( mass_point );
};

/**
 * Adds a rigid body to the world
 *
 * @method addRigidBody
 * @param rigid_body {Goblin.RigidBody} rigid body to add to the world
 */
Goblin.World.prototype.addRigidBody = function( rigid_body ) {
	rigid_body.world = this;
	this.rigid_bodies.push( rigid_body );
	this.broadphase.addBody( rigid_body );
};

/**
 * Removes a rigid body from the world
 *
 * @method removeRigidBody
 * @param rigid_body {Goblin.RigidBody} rigid body to remove from the world
 */
Goblin.World.prototype.removeRigidBody = function( rigid_body ) {
	var i,
		rigid_body_count = this.rigid_bodies.length;

	for ( i = 0; i < rigid_body_count; i++ ) {
		if ( this.rigid_bodies[i] === rigid_body ) {
			this.rigid_bodies.splice( i, 1 );
			this.broadphase.removeBody( rigid_body );
			break;
		}
	}
};

/**
 * Adds a force generator to the world
 *
 * @method addForceGenerator
 * @param force_generator {Goblin.ForceGenerator} force generator object to be added
 */
Goblin.World.prototype.addForceGenerator = function( force_generator ) {
	var i, force_generators_count;
	// Make sure this generator isn't already in the world
	for ( i = 0, force_generators_count = this.force_generators.length; i < force_generators_count; i++ ) {
		if ( this.force_generators[i] === force_generator ) {
			return;
		}
	}

	this.force_generators.push( force_generator );
};
/**
 * removes a force generator from the world
 *
 * @method removeForceGenerator
 * @param force_generatorv {Goblin.ForceGenerator} force generator object to be removed
 */
Goblin.World.prototype.removeForceGenerator = function( force_generator ) {
	var i, force_generators_count;
	for ( i = 0, force_generators_count = this.force_generators.length; i < force_generators_count; i++ ) {
		if ( this.force_generators[i] === force_generator ) {
			this.force_generators.splice( i, 1 );
			return;
		}
	}
};
/**
 * adds a constraint to the world
 *
 * @method addConstraint
 * @param constraint {Goblin.Constraint} constraint object to be added
 */
Goblin.World.prototype.addConstraint = function( constraint ) {
	var i, constraints_count;
	// Make sure this constraint isn't already in the world
	for ( i = 0, constraints_count = this.constraints.length; i < constraints_count; i++ ) {
		if ( this.constraints[i] === constraint ) {
			return;
		}
	}

	constraint.world = this;
	this.constraints.push( constraint );
};
/**
 * removes a constraint from the world
 *
 * @method removeConstraint
 * @param constraint {Goblin.Constraint} constraint object to be removed
 */
Goblin.World.prototype.removeConstraint = function( constraint ) {
	var i, constraints_count;
	for ( i = 0, constraints_count = this.constraints.length; i < constraints_count; i++ ) {
		if ( this.constraints[i] === constraint ) {
			this.constraints.splice( i, 1 );
			return;
		}
	}
};
	return Goblin;
})();