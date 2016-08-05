(function () { 'use strict';

    /**
    * Goblin Physics
    *
    * @module Goblin
    */
    (function(){
    	var Goblin = {};
    Goblin.Matrix3 = function( e00, e01, e02, e10, e11, e12, e20, e21, e22 ) {
    	this.e00 = e00 || 0;
    	this.e01 = e01 || 0;
    	this.e02 = e02 || 0;

    	this.e10 = e10 || 0;
    	this.e11 = e11 || 0;
    	this.e12 = e12 || 0;

    	this.e20 = e20 || 0;
    	this.e21 = e21 || 0;
    	this.e22 = e22 || 0;
    };

    Goblin.Matrix3.prototype = {
    	identity: function() {
    		this.e00 = 1;
    		this.e01 = 0;
    		this.e02 = 0;

    		this.e10 = 0;
    		this.e11 = 1;
    		this.e12 = 0;

    		this.e20 = 0;
    		this.e21 = 0;
    		this.e22 = 1;
    	},

    	fromMatrix4: function( m ) {
    		this.e00 = m.e00;
    		this.e01 = m.e01;
    		this.e02 = m.e02;

    		this.e10 = m.e10;
    		this.e11 = m.e11;
    		this.e12 = m.e12;

    		this.e20 = m.e20;
    		this.e21 = m.e21;
    		this.e22 = m.e22;
    	},

    	fromQuaternion: function( q ) {
    		var x2 = q.x + q.x,
    			y2 = q.y + q.y,
    			z2 = q.z + q.z,

    			xx = q.x * x2,
    			xy = q.x * y2,
    			xz = q.x * z2,
    			yy = q.y * y2,
    			yz = q.y * z2,
    			zz = q.z * z2,
    			wx = q.w * x2,
    			wy = q.w * y2,
    			wz = q.w * z2;

    		this.e00 = 1 - (yy + zz);
    		this.e10 = xy + wz;
    		this.e20 = xz - wy;

    		this.e01 = xy - wz;
    		this.e11 = 1 - (xx + zz);
    		this.e21 = yz + wx;

    		this.e02 = xz + wy;
    		this.e12 = yz - wx;
    		this.e22 = 1 - (xx + yy);
    	},

    	transformVector3: function( v ) {
    		var x = v.x,
    			y = v.y,
    			z = v.z;
    		v.x = this.e00 * x + this.e01 * y + this.e02 * z;
    		v.y = this.e10 * x + this.e11 * y + this.e12 * z;
    		v.z = this.e20 * x + this.e21 * y + this.e22 * z;
    	},

    	transformVector3Into: function( v, dest ) {
    		dest.x = this.e00 * v.x + this.e01 * v.y + this.e02 * v.z;
    		dest.y = this.e10 * v.x + this.e11 * v.y + this.e12 * v.z;
    		dest.z = this.e20 * v.x + this.e21 * v.y + this.e22 * v.z;
    	},

    	transposeInto: function( m ) {
    		m.e00 = this.e00;
    		m.e10 = this.e01;
    		m.e20 = this.e02;
    		m.e01 = this.e10;
    		m.e11 = this.e11;
    		m.e21 = this.e12;
    		m.e02 = this.e20;
    		m.e12 = this.e21;
    		m.e22 = this.e22;
    	},

    	invert: function() {
    		var a00 = this.e00, a01 = this.e01, a02 = this.e02,
    			a10 = this.e10, a11 = this.e11, a12 = this.e12,
    			a20 = this.e20, a21 = this.e21, a22 = this.e22,

    			b01 = a22 * a11 - a12 * a21,
    			b11 = -a22 * a10 + a12 * a20,
    			b21 = a21 * a10 - a11 * a20,

    			d = a00 * b01 + a01 * b11 + a02 * b21,
    			id;

    		if ( !d ) {
    			return true;
    		}
    		id = 1 / d;

    		this.e00 = b01 * id;
    		this.e01 = (-a22 * a01 + a02 * a21) * id;
    		this.e02 = (a12 * a01 - a02 * a11) * id;
    		this.e10 = b11 * id;
    		this.e11 = (a22 * a00 - a02 * a20) * id;
    		this.e12 = (-a12 * a00 + a02 * a10) * id;
    		this.e20 = b21 * id;
    		this.e21 = (-a21 * a00 + a01 * a20) * id;
    		this.e22 = (a11 * a00 - a01 * a10) * id;

    		return true;
    	},

    	invertInto: function( m ) {
    		var a00 = this.e00, a01 = this.e01, a02 = this.e02,
    			a10 = this.e10, a11 = this.e11, a12 = this.e12,
    			a20 = this.e20, a21 = this.e21, a22 = this.e22,

    			b01 = a22 * a11 - a12 * a21,
    			b11 = -a22 * a10 + a12 * a20,
    			b21 = a21 * a10 - a11 * a20,

    			d = a00 * b01 + a01 * b11 + a02 * b21,
    			id;

    		if ( !d ) {
    			return false;
    		}
    		id = 1 / d;

    		m.e00 = b01 * id;
    		m.e01 = (-a22 * a01 + a02 * a21) * id;
    		m.e02 = (a12 * a01 - a02 * a11) * id;
    		m.e10 = b11 * id;
    		m.e11 = (a22 * a00 - a02 * a20) * id;
    		m.e12 = (-a12 * a00 + a02 * a10) * id;
    		m.e20 = b21 * id;
    		m.e21 = (-a21 * a00 + a01 * a20) * id;
    		m.e22 = (a11 * a00 - a01 * a10) * id;

    		return true;
    	},

    	multiply: function( m ) {
    		var a00 = this.e00, a01 = this.e01, a02 = this.e02,
    			a10 = this.e10, a11 = this.e11, a12 = this.e12,
    			a20 = this.e20, a21 = this.e21, a22 = this.e22,

    			b00 = m.e00, b01 = m.e01, b02 = m.e02,
    			b10 = m.e10, b11 = m.e11, b12 = m.e12,
    			b20 = m.e20, b21 = m.e21, b22 = m.e22;

    		this.e00 = b00 * a00 + b10 * a01 + b20 * a02;
    		this.e10 = b00 * a10 + b10 * a11 + b20 * a12;
    		this.e20 = b00 * a20 + b10 * a21 + b20 * a22;

    		this.e01 = b01 * a00 + b11 * a01 + b21 * a02;
    		this.e11 = b01 * a10 + b11 * a11 + b21 * a12;
    		this.e21 = b01 * a20 + b11 * a21 + b21 * a22;

    		this.e02 = b02 * a00 + b12 * a01 + b22 * a02;
    		this.e12 = b02 * a10 + b12 * a11 + b22 * a12;
    		this.e22 = b02 * a20 + b12 * a21 + b22 * a22;
    	},

    	multiplyFrom: function( a, b ) {
    		var a00 = a.e00, a01 = a.e01, a02 = a.e02,
    			a10 = a.e10, a11 = a.e11, a12 = a.e12,
    			a20 = a.e20, a21 = a.e21, a22 = a.e22,

    			b00 = b.e00, b01 = b.e01, b02 = b.e02,
    			b10 = b.e10, b11 = b.e11, b12 = b.e12,
    			b20 = b.e20, b21 = b.e21, b22 = b.e22;

    		this.e00 = b00 * a00 + b10 * a01 + b20 * a02;
    		this.e10 = b00 * a10 + b10 * a11 + b20 * a12;
    		this.e20 = b00 * a20 + b10 * a21 + b20 * a22;

    		this.e01 = b01 * a00 + b11 * a01 + b21 * a02;
    		this.e11 = b01 * a10 + b11 * a11 + b21 * a12;
    		this.e21 = b01 * a20 + b11 * a21 + b21 * a22;

    		this.e02 = b02 * a00 + b12 * a01 + b22 * a02;
    		this.e12 = b02 * a10 + b12 * a11 + b22 * a12;
    		this.e22 = b02 * a20 + b12 * a21 + b22 * a22;
    	}
    };
    Goblin.Matrix4 = function() {
    	this.e00 = 0;
    	this.e01 = 0;
    	this.e02 = 0;
    	this.e03 = 0;

    	this.e10 = 0;
    	this.e11 = 0;
    	this.e12 = 0;
    	this.e13 = 0;

    	this.e20 = 0;
    	this.e21 = 0;
    	this.e22 = 0;
    	this.e23 = 0;

    	this.e30 = 0;
    	this.e31 = 0;
    	this.e32 = 0;
    	this.e33 = 0;
    };

    Goblin.Matrix4.prototype = {
    	identity: function() {
    		this.e00 = 1;
    		this.e01 = 0;
    		this.e02 = 0;
    		this.e03 = 0;

    		this.e10 = 0;
    		this.e11 = 1;
    		this.e12 = 0;
    		this.e13 = 0;

    		this.e20 = 0;
    		this.e21 = 0;
    		this.e22 = 1;
    		this.e23 = 0;

    		this.e30 = 0;
    		this.e31 = 0;
    		this.e32 = 0;
    		this.e33 = 1;
    	},

    	copy: function( m ) {
    		this.e00 = m.e00;
    		this.e01 = m.e01;
    		this.e02 = m.e02;
    		this.e03 = m.e03;

    		this.e10 = m.e10;
    		this.e11 = m.e11;
    		this.e12 = m.e12;
    		this.e13 = m.e13;

    		this.e20 = m.e20;
    		this.e21 = m.e21;
    		this.e22 = m.e22;
    		this.e23 = m.e23;

    		this.e30 = m.e30;
    		this.e31 = m.e31;
    		this.e32 = m.e32;
    		this.e33 = m.e33;
    	},

    	makeTransform: function( rotation, translation ) {
    		// Setup rotation
    		var x2 = rotation.x + rotation.x,
    			y2 = rotation.y + rotation.y,
    			z2 = rotation.z + rotation.z,
    			xx = rotation.x * x2,
    			xy = rotation.x * y2,
    			xz = rotation.x * z2,
    			yy = rotation.y * y2,
    			yz = rotation.y * z2,
    			zz = rotation.z * z2,
    			wx = rotation.w * x2,
    			wy = rotation.w * y2,
    			wz = rotation.w * z2;

    		this.e00 = 1 - ( yy + zz );
    		this.e10 = xy + wz;
    		this.e20 = xz - wy;
    		this.e30 = 0;
    		this.e01 = xy - wz;
    		this.e11 = 1 - (xx + zz);
    		this.e21 = yz + wx;
    		this.e31 = 0;
    		this.e02 = xz + wy;
    		this.e12 = yz - wx;
    		this.e22 = 1 - (xx + yy);
    		this.e32 = 0;

    		// Translation
    		this.e03 = translation.x;
    		this.e13 = translation.y;
    		this.e23 = translation.z;
    		this.e33 = 1;
    	},

    	transformVector3: function( v ) {
    		// Technically this should compute the `w` term and divide the resulting vector
    		// components by `w` to homogenize but we don't scale so `w` is just `1`
    		var x = v.x,
    			y = v.y,
    			z = v.z;
    		v.x = this.e00 * x + this.e01 * y + this.e02 * z + this.e03;
    		v.y = this.e10 * x + this.e11 * y + this.e12 * z + this.e13;
    		v.z = this.e20 * x + this.e21 * y + this.e22 * z + this.e23;
    	},

    	transformVector3Into: function( v, dest ) {
    		// Technically this should compute the `w` term and divide the resulting vector
    		// components by `w` to homogenize but we don't scale so `w` is just `1`
    		dest.x = this.e00 * v.x + this.e01 * v.y + this.e02 * v.z + this.e03;
    		dest.y = this.e10 * v.x + this.e11 * v.y + this.e12 * v.z + this.e13;
    		dest.z = this.e20 * v.x + this.e21 * v.y + this.e22 * v.z + this.e23;
    	},

    	rotateVector3: function( v ) {
    		var x = v.x,
    			y = v.y,
    			z = v.z;
    		v.x = this.e00 * x + this.e01 * y + this.e02 * z;
    		v.y = this.e10 * x + this.e11 * y + this.e12 * z;
    		v.z = this.e20 * x + this.e21 * y + this.e22 * z;
    	},

    	rotateVector3Into: function( v, dest ) {
    		dest.x = this.e00 * v.x + this.e01 * v.y + this.e02 * v.z;
    		dest.y = this.e10 * v.x + this.e11 * v.y + this.e12 * v.z;
    		dest.z = this.e20 * v.x + this.e21 * v.y + this.e22 * v.z;
    	},

    	invert: function() {
    		var a00 = this.e00, a01 = this.e01, a02 = this.e02, a03 = this.e03,
    			a10 = this.e10, a11 = this.e11, a12 = this.e12, a13 = this.e13,
    			a20 = this.e20, a21 = this.e21, a22 = this.e22, a23 = this.e23,
    			a30 = this.e30, a31 = this.e31, a32 = this.e32, a33 = this.e33,

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

    			d = (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06),
    			invDet;

    		// Calculate the determinant
    		if ( !d ) {
    			return false;
    		}
    		invDet = 1 / d;

    		this.e00 = (a11 * b11 - a12 * b10 + a13 * b09) * invDet;
    		this.e01 = (-a01 * b11 + a02 * b10 - a03 * b09) * invDet;
    		this.e02 = (a31 * b05 - a32 * b04 + a33 * b03) * invDet;
    		this.e03 = (-a21 * b05 + a22 * b04 - a23 * b03) * invDet;
    		this.e10 = (-a10 * b11 + a12 * b08 - a13 * b07) * invDet;
    		this.e11 = (a00 * b11 - a02 * b08 + a03 * b07) * invDet;
    		this.e12 = (-a30 * b05 + a32 * b02 - a33 * b01) * invDet;
    		this.e13 = (a20 * b05 - a22 * b02 + a23 * b01) * invDet;
    		this.e20 = (a10 * b10 - a11 * b08 + a13 * b06) * invDet;
    		this.e21 = (-a00 * b10 + a01 * b08 - a03 * b06) * invDet;
    		this.e22 = (a30 * b04 - a31 * b02 + a33 * b00) * invDet;
    		this.e23 = (-a20 * b04 + a21 * b02 - a23 * b00) * invDet;
    		this.e30 = (-a10 * b09 + a11 * b07 - a12 * b06) * invDet;
    		this.e31 = (a00 * b09 - a01 * b07 + a02 * b06) * invDet;
    		this.e32 = (-a30 * b03 + a31 * b01 - a32 * b00) * invDet;
    		this.e33 = (a20 * b03 - a21 * b01 + a22 * b00) * invDet;

    		return true;
    	},

    	invertInto: function( m ) {
    		var a00 = this.e00, a01 = this.e10, a02 = this.e20, a03 = this.e30,
    			a10 = this.e01, a11 = this.e11, a12 = this.e21, a13 = this.e31,
    			a20 = this.e02, a21 = this.e12, a22 = this.e22, a23 = this.e32,
    			a30 = this.e03, a31 = this.e13, a32 = this.e23, a33 = this.e33,

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

    			d = (b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06),
    			invDet;

    		// Calculate the determinant
    		if ( !d ) {
    			return false;
    		}
    		invDet = 1 / d;

    		m.e00 = (a11 * b11 - a12 * b10 + a13 * b09) * invDet;
    		m.e10 = (-a01 * b11 + a02 * b10 - a03 * b09) * invDet;
    		m.e20 = (a31 * b05 - a32 * b04 + a33 * b03) * invDet;
    		m.e30 = (-a21 * b05 + a22 * b04 - a23 * b03) * invDet;
    		m.e01 = (-a10 * b11 + a12 * b08 - a13 * b07) * invDet;
    		m.e11 = (a00 * b11 - a02 * b08 + a03 * b07) * invDet;
    		m.e21 = (-a30 * b05 + a32 * b02 - a33 * b01) * invDet;
    		m.e31 = (a20 * b05 - a22 * b02 + a23 * b01) * invDet;
    		m.e02 = (a10 * b10 - a11 * b08 + a13 * b06) * invDet;
    		m.e12 = (-a00 * b10 + a01 * b08 - a03 * b06) * invDet;
    		m.e22 = (a30 * b04 - a31 * b02 + a33 * b00) * invDet;
    		m.e32 = (-a20 * b04 + a21 * b02 - a23 * b00) * invDet;
    		m.e03 = (-a10 * b09 + a11 * b07 - a12 * b06) * invDet;
    		m.e13 = (a00 * b09 - a01 * b07 + a02 * b06) * invDet;
    		m.e23 = (-a30 * b03 + a31 * b01 - a32 * b00) * invDet;
    		m.e33 = (a20 * b03 - a21 * b01 + a22 * b00) * invDet;
    	},

    	multiply: function( m ) {
    		// Cache the matrix values (makes for huge speed increases!)
    		var a00 = this.e00, a01 = this.e10, a02 = this.e20, a03 = this.e30;
    		var a10 = this.e01, a11 = this.e11, a12 = this.e21, a13 = this.e31;
    		var a20 = this.e02, a21 = this.e12, a22 = this.e22, a23 = this.e32;
    		var a30 = this.e03, a31 = this.e13, a32 = this.e23, a33 = this.e33;

    		// Cache only the current line of the second matrix
    		var b0  = m.e00, b1 = m.e10, b2 = m.e20, b3 = m.e30;
    		this.e00 = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    		this.e10 = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    		this.e20 = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    		this.e30 = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    		b0 = m.e01;
    		b1 = m.e11;
    		b2 = m.e21;
    		b3 = m.e31;
    		this.e01 = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    		this.e11 = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    		this.e21 = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    		this.e31 = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    		b0 = m.e02;
    		b1 = m.e12;
    		b2 = m.e22;
    		b3 = m.e32;
    		this.e02 = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    		this.e12 = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    		this.e22 = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    		this.e32 = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    		b0 = m.e03;
    		b1 = m.e13;
    		b2 = m.e23;
    		b3 = m.e33;
    		this.e03 = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    		this.e13 = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    		this.e23 = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    		this.e33 = b0*a03 + b1*a13 + b2*a23 + b3*a33;
    	}
    };
    Goblin.Quaternion = function( x, y, z, w ) {
    	this.x = x != null ? x : 0;
    	this.y = y != null ? y : 0;
    	this.z = z != null ? z : 0;
    	this.w = w != null ? w : 1;
    	this.normalize();
    };

    Goblin.Quaternion.prototype = {
    	set: function( x, y, z, w ) {
    		this.x = x;
    		this.y = y;
    		this.z = z;
    		this.w = w;
    	},

    	multiply: function( q ) {
    		var x = this.x, y = this.y, z = this.z, w = this.w,
    			qx = q.x, qy = q.y, qz = q.z, qw = q.w;

    		this.x = x * qw + w * qx + y * qz - z * qy;
    		this.y = y * qw + w * qy + z * qx - x * qz;
    		this.z = z * qw + w * qz + x * qy - y * qx;
    		this.w = w * qw - x * qx - y * qy - z * qz;
    	},

    	multiplyQuaternions: function( a, b ) {
    		this.x = a.x * b.w + a.w * b.x + a.y * b.z - a.z * b.y;
    		this.y = a.y * b.w + a.w * b.y + a.z * b.x - a.x * b.z;
    		this.z = a.z * b.w + a.w * b.z + a.x * b.y - a.y * b.x;
    		this.w = a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z;
    	},

    	normalize: function() {
    		var x = this.x, y = this.y, z = this.z, w = this.w,
    			length = Math.sqrt( x * x + y * y + z * z + w * w );

    		if ( length === 0) {
    			this.x = this.y = this.z = this.w = 0;
    		} else {
    			length = 1 / length;
    			this.x *= length;
    			this.y *= length;
    			this.z *= length;
    			this.w *= length;
    		}
    	},

    	invertQuaternion: function( q ) {
    		var x = q.x, y = q.y, z = q.z, w = q.w,
    			dot = x * x + y * y + z * z + w * w;

    		if ( dot === 0 ) {
    			this.x = this.y = this.z = this.w = 0;
    		} else {
    			var inv_dot = -1 / dot;
    			this.x = q.x * inv_dot;
    			this.y = q.y *  inv_dot;
    			this.z = q.z *  inv_dot;
    			this.w = q.w *  -inv_dot;
    		}
    	},

    	transformVector3: function( v ) {
    		var x = v.x, y = v.y, z = v.z,
    			qx = this.x, qy = this.y, qz = this.z, qw = this.w,

    		// calculate quat * vec
    			ix = qw * x + qy * z - qz * y,
    			iy = qw * y + qz * x - qx * z,
    			iz = qw * z + qx * y - qy * x,
    			iw = -qx * x - qy * y - qz * z;

    		// calculate result * inverse quat
    		v.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    		v.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    		v.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    	},

    	transformVector3Into: function( v, dest ) {
    		var x = v.x, y = v.y, z = v.z,
    			qx = this.x, qy = this.y, qz = this.z, qw = this.w,

    		// calculate quat * vec
    			ix = qw * x + qy * z - qz * y,
    			iy = qw * y + qz * x - qx * z,
    			iz = qw * z + qx * y - qy * x,
    			iw = -qx * x - qy * y - qz * z;

    		// calculate result * inverse quat
    		dest.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
    		dest.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
    		dest.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
    	},

    	angleBetween: function( q ) {
    		/*_tmp_quat4_1.invertQuaternion( this );
    		_tmp_quat4_1.multiply( q );
    		_tmp_vec3_1.set( _tmp_quat4_1.x, _tmp_quat4_1.y, _tmp_quat4_1.z );
    		return 2 * Math.atan2( _tmp_vec3_1.length(), Math.abs( _tmp_quat4_1.w ) );*/

    		return 2 * Math.acos( this.x * q.x + this.y * q.y + this.z * q.z + this.w * q.w );
    	},

    	signedAngleBetween: function( q, normal ) {
    		if ( Math.abs(x_axis.dot( normal )) < 0.5 ) {
    			_tmp_vec3_1.set( 1, 0, 0 );
    		} else {
    			_tmp_vec3_1.set( 0, 0, 1 );
    		}
    		this.transformVector3Into( _tmp_vec3_1, _tmp_vec3_2 );
    		q.transformVector3Into( _tmp_vec3_1, _tmp_vec3_3 );

    		_tmp_vec3_1.crossVectors( _tmp_vec3_2, _tmp_vec3_3 );
    		return Math.atan2(
    			normal.dot( _tmp_vec3_1 ),
    			_tmp_vec3_2.dot( _tmp_vec3_3 )
    		);
    	}
    };
    Goblin.Vector3 = function( x, y, z ) {
    	this.x = x || 0;
    	this.y = y || 0;
    	this.z = z || 0;
    };

    Goblin.Vector3.prototype = {
    	set: function( x, y, z ) {
    		this.x = x;
    		this.y = y;
    		this.z = z;
    	},

    	copy: function( v ) {
    		this.x = v.x;
    		this.y = v.y;
    		this.z = v.z;
    	},

    	add: function( v ) {
    		this.x += v.x;
    		this.y += v.y;
    		this.z += v.z;
    	},

    	addVectors: function( a, b ) {
    		this.x = a.x + b.x;
    		this.y = a.y + b.y;
    		this.z = a.z + b.z;
    	},

    	subtract: function( v ) {
    		this.x -= v.x;
    		this.y -= v.y;
    		this.z -= v.z;
    	},

    	subtractVectors: function( a, b ) {
    		this.x = a.x - b.x;
    		this.y = a.y - b.y;
    		this.z = a.z - b.z;
    	},

    	multiply: function( v ) {
    		this.x *= v.x;
    		this.y *= v.y;
    		this.z *= v.z;
    	},

    	multiplyVectors: function( a, b ) {
    		this.x = a.x * b.x;
    		this.y = a.y * b.y;
    		this.z = a.z * b.z;
    	},

    	scale: function( scalar ) {
    		this.x *= scalar;
    		this.y *= scalar;
    		this.z *= scalar;
    	},

    	scaleVector: function( v, scalar ) {
    		this.x = v.x * scalar;
    		this.y = v.y * scalar;
    		this.z = v.z * scalar;
    	},

    	lengthSquared: function() {
    		return this.dot( this );
    	},

    	length: function() {
    		return Math.sqrt( this.lengthSquared() );
    	},

    	normalize: function() {
    		var length = this.length();
    		if ( length === 0 ) {
    			this.x = this.y = this.z = 0;
    		} else {
    			this.scale( 1 / length );
    		}
    	},

    	normalizeVector: function( v ) {
    		this.copy( v );
    		this.normalize();
    	},

    	dot: function( v ) {
    		return this.x * v.x + this.y * v.y + this.z * v.z;
    	},

    	cross: function( v ) {
    		var x = this.x, y = this.y, z = this.z;

    		this.x = y * v.z - z * v.y;
    		this.y = z * v.x - x * v.z;
    		this.z = x * v.y - y * v.x;
    	},

    	crossVectors: function( a, b ) {
    		this.x = a.y * b.z - a.z * b.y;
    		this.y = a.z * b.x - a.x * b.z;
    		this.z = a.x * b.y - a.y * b.x;
    	},

    	distanceTo: function( v ) {
    		var x = v.x - this.x,
    			y = v.y - this.y,
    			z = v.z - this.z;
    		return Math.sqrt( x*x + y*y + z*z );
    	},

    	findOrthogonal: function( o1, o2 ) {
    		var a, k;
    		if ( Math.abs( this.z ) > 0.7071067811865476 ) {
    			// choose p in y-z plane
    			a = -this.y * this.y + this.z * this.z;
    			k = 1 / Math.sqrt( a );
    			o1.set( 0, -this.z * k, this.y * k );
    			// set q = n x p
    			o2.set( a * k, -this.x * o1.z, this.x * o1.y );
    		}
    		else {
    			// choose p in x-y plane
    			a = this.x * this.x + this.y * this.y;
    			k = 1 / Math.sqrt( a );
    			o1.set( -this.y * k, this.x * k, 0 );
    			// set q = n x p
    			o2.set( -this.z * o1.y, this.z * o1.x, a * k );
    		}
    	}
    };
    Goblin.EPSILON = 0.00001;

    var _tmp_vec3_1 = new Goblin.Vector3(),
    	_tmp_vec3_2 = new Goblin.Vector3(),
    	_tmp_vec3_3 = new Goblin.Vector3(),

    	x_axis = new Goblin.Vector3( 1, 0, 0 ),
    	y_axis = new Goblin.Vector3( 0, 1, 0 ),
    	z_axis = new Goblin.Vector3( 0, 0, 1 ),

    	_tmp_quat4_1 = new Goblin.Quaternion(),
    	_tmp_quat4_2 = new Goblin.Quaternion(),

    	_tmp_mat3_1 = new Goblin.Matrix3(),
    	_tmp_mat3_2 = new Goblin.Matrix3();
    Goblin.EventEmitter = function(){};

    Goblin.EventEmitter.prototype = {
    	addListener: function( event, listener ) {
    		if ( this.listeners[event] == null ) {
    			this.listeners[event] = [];
    		}

    		if ( this.listeners[event].indexOf( listener ) === -1 ) {
    			this.listeners[event].push( listener );
    		}
    	},

    	removeListener: function( event, listener ) {
    		if ( this.listeners[event] == null ) {
    			this.listeners[event] = [];
    		}

    		var index = this.listeners[event].indexOf( listener );
    		if ( index !== -1 ) {
    			this.listeners[event].splice( index, 1 );
    		}
    	},

    	removeAllListeners: function() {
    		var listeners = Object.keys( this.listeners );
    		for ( var i = 0; i < listeners.length; i++ ) {
    			this.listeners[listeners[i]].length = 0;
    		}
    	},

    	emit: function( event ) {
    		var event_arguments = Array.prototype.slice.call( arguments, 1 ),
    			ret_value;

    		if ( this.listeners[event] instanceof Array ) {
    			var listeners = this.listeners[event].slice();
    			for ( var i = 0; i < listeners.length; i++ ) {
    				ret_value = listeners[i].apply( this, event_arguments );
    				if ( ret_value === false ) {
    					return false;
    				}
    			}
    		}
    	}
    };

    Goblin.EventEmitter.apply = function( klass ) {
    	klass.prototype.addListener = Goblin.EventEmitter.prototype.addListener;
    	klass.prototype.removeListener = Goblin.EventEmitter.prototype.removeListener;
    	klass.prototype.removeAllListeners = Goblin.EventEmitter.prototype.removeAllListeners;
    	klass.prototype.emit = Goblin.EventEmitter.prototype.emit;
    };
    /**
     * Represents a rigid body
     *
     * @class RigidBody
     * @constructor
     * @param shape
     * @param mass {Number}
     */
    Goblin.RigidBody = (function() {
    	var body_count = 0;

    	return function( shape, mass ) {
    		/**
    		 * goblin ID of the body
    		 *
    		 * @property id
    		 * @type {Number}
    		 */
    		this.id = body_count++;

    		/**
    		 * shape definition for this rigid body
    		 *
    		 * @property shape
    		 */
    		this.shape = shape;

            /**
             * axis-aligned bounding box enclosing this body
             *
             * @property aabb
             * @type {AABB}
             */
            this.aabb = new Goblin.AABB();

    		/**
    		 * the rigid body's mass
    		 *
    		 * @property mass
    		 * @type {Number}
    		 * @default Infinity
    		 */
    		this._mass = mass || Infinity;
    		this._mass_inverted = 1 / mass;

    		/**
    		 * the rigid body's current position
    		 *
    		 * @property position
    		 * @type {vec3}
    		 * @default [ 0, 0, 0 ]
    		 */
    		this.position = new Goblin.Vector3();

    		/**
    		 * rotation of the rigid body
    		 *
    		 * @type {quat4}
    		 */
    		this.rotation = new Goblin.Quaternion( 0, 0, 0, 1 );

    		/**
    		 * the rigid body's current linear velocity
    		 *
    		 * @property linear_velocity
    		 * @type {vec3}
    		 * @default [ 0, 0, 0 ]
    		 */
    		this.linear_velocity = new Goblin.Vector3();

    		/**
    		 * the rigid body's current angular velocity
    		 *
    		 * @property angular_velocity
    		 * @type {vec3}
    		 * @default [ 0, 0, 0 ]
    		 */
    		this.angular_velocity = new Goblin.Vector3();

    		/**
    		 * transformation matrix transforming points from object space to world space
    		 *
    		 * @property transform
    		 * @type {mat4}
    		 */
    		this.transform = new Goblin.Matrix4();
    		this.transform.identity();

    		/**
    		 * transformation matrix transforming points from world space to object space
    		 *
    		 * @property transform_inverse
    		 * @type {mat4}
    		 */
    		this.transform_inverse = new Goblin.Matrix4();
    		this.transform_inverse.identity();

    		this.inertiaTensor = shape.getInertiaTensor( mass );

    		this.inverseInertiaTensor = new Goblin.Matrix3();
    		this.inertiaTensor.invertInto( this.inverseInertiaTensor );

    		this.inertiaTensorWorldFrame = new Goblin.Matrix3();

    		this.inverseInertiaTensorWorldFrame = new Goblin.Matrix3();

    		/**
    		 * the rigid body's current acceleration
    		 *
    		 * @property acceleration
    		 * @type {vec3}
    		 * @default [ 0, 0, 0 ]
    		 */
    		this.acceleration = new Goblin.Vector3();

    		/**
    		 * amount of restitution this object has
    		 *
    		 * @property restitution
    		 * @type {Number}
    		 * @default 0.1
    		 */
    		this.restitution = 0.1;

    		/**
    		 * amount of friction this object has
    		 *
    		 * @property friction
    		 * @type {Number}
    		 * @default 0.5
    		 */
    		this.friction = 0.5;

    		/**
    		 * bitmask indicating what collision groups this object belongs to
    		 * @type {number}
    		 */
    		this.collision_groups = 0;

    		/**
    		 * collision groups mask for the object, specifying what groups to not collide with (BIT 1=0) or which groups to only collide with (Bit 1=1)
    		 * @type {number}
    		 */
    		this.collision_mask = 0;

    		/**
    		 * the rigid body's custom gravity
    		 *
    		 * @property gravity
    		 * @type {vec3}
    		 * @default null
    		 * @private
    		 */
    		this.gravity = null;

    		/**
    		 * proportion of linear velocity lost per second ( 0.0 - 1.0 )
    		 *
    		 * @property linear_damping
    		 * @type {Number}
    		 */
    		this.linear_damping = 0;

    		/**
    		 * proportion of angular velocity lost per second ( 0.0 - 1.0 )
    		 *
    		 * @property angular_damping
    		 * @type {Number}
    		 */
    		this.angular_damping = 0;

    		/**
    		 * multiplier of linear force applied to this body
    		 *
    		 * @property linear_factor
    		 * @type {Goblin.Vector3}
    		 */
    		this.linear_factor = new Goblin.Vector3( 1, 1, 1 );

    		/**
    		 * multiplier of angular force applied to this body
    		 *
    		 * @property angular_factor
    		 * @type {Goblin.Vector3}
    		 */
    		this.angular_factor = new Goblin.Vector3( 1, 1, 1 );

    		/**
    		 * the world to which the rigid body has been added,
    		 * this is set when the rigid body is added to a world
    		 *
    		 * @property world
    		 * @type {Goblin.World}
    		 * @default null
    		 */
    		this.world = null;

    		/**
    		 * all resultant force accumulated by the rigid body
    		 * this force is applied in the next occurring integration
    		 *
    		 * @property accumulated_force
    		 * @type {vec3}
    		 * @default [ 0, 0, 0 ]
    		 * @private
    		 */
    		this.accumulated_force = new Goblin.Vector3();

    		/**
    		 * All resultant torque accumulated by the rigid body
    		 * this torque is applied in the next occurring integration
    		 *
    		 * @property accumulated_force
    		 * @type {vec3}
    		 * @default [ 0, 0, 0 ]
    		 * @private
    		 */
    		this.accumulated_torque = new Goblin.Vector3();

    		// Used by the constraint solver to determine what impulse needs to be added to the body
    		this.push_velocity = new Goblin.Vector3();
    		this.turn_velocity = new Goblin.Vector3();
    		this.solver_impulse = new Float64Array( 6 );

    		// Set default derived values
    		this.updateDerived();

    		this.listeners = {};
    	};
    })();
    Goblin.EventEmitter.apply( Goblin.RigidBody );

    Object.defineProperty(
    	Goblin.RigidBody.prototype,
    	'mass',
    	{
    		get: function() {
    			return this._mass;
    		},
    		set: function( n ) {
    			this._mass = n;
    			this._mass_inverted = 1 / n;
    			this.inertiaTensor = this.shape.getInertiaTensor( n );
    		}
    	}
    );

    /**
     * Given `direction`, find the point in this body which is the most extreme in that direction.
     * This support point is calculated in world coordinates and stored in the second parameter `support_point`
     *
     * @method findSupportPoint
     * @param direction {vec3} direction to use in finding the support point
     * @param support_point {vec3} vec3 variable which will contain the supporting point after calling this method
     */
    Goblin.RigidBody.prototype.findSupportPoint = (function(){
    	var local_direction = new Goblin.Vector3();

    	return function( direction, support_point ) {
    		// Convert direction into local frame for the shape
    		this.transform_inverse.rotateVector3Into( direction, local_direction );

    		this.shape.findSupportPoint( local_direction, support_point );

    		// Convert from the shape's local coordinates to world coordinates
    		this.transform.transformVector3( support_point );
    	};
    })();

    /**
     * Checks if a ray segment intersects with the object
     *
     * @method rayIntersect
     * @property ray_start {vec3} start point of the segment
     * @property ray_end {vec3{ end point of the segment
     * @property intersection_list {Array} array to append intersection to
     */
    Goblin.RigidBody.prototype.rayIntersect = (function(){
    	var local_start = new Goblin.Vector3(),
    		local_end = new Goblin.Vector3();

    	return function( ray_start, ray_end, intersection_list ) {
    		// transform start & end into local coordinates
    		this.transform_inverse.transformVector3Into( ray_start, local_start );
    		this.transform_inverse.transformVector3Into( ray_end, local_end );

    		// Intersect with shape
    		var intersection = this.shape.rayIntersect( local_start, local_end );

    		if ( intersection != null ) {
    			intersection.object = this; // change from the shape to the body
    			this.transform.transformVector3( intersection.point ); // transform shape's local coordinates to the body's world coordinates

                // Rotate intersection normal
    			this.transform.rotateVector3( intersection.normal );

    			intersection_list.push( intersection );
    		}
    	};
    })();

    /**
     * Updates the rigid body's position, velocity, and acceleration
     *
     * @method integrate
     * @param timestep {Number} time, in seconds, to use in integration
     */
    Goblin.RigidBody.prototype.integrate = function( timestep ) {
    	if ( this._mass === Infinity ) {
    		return;
    	}

    	// Add accumulated linear force
    	_tmp_vec3_1.scaleVector( this.accumulated_force, this._mass_inverted );
    	_tmp_vec3_1.multiply( this.linear_factor );
    	this.linear_velocity.add( _tmp_vec3_1 );

    	// Add accumulated angular force
    	this.inverseInertiaTensorWorldFrame.transformVector3Into( this.accumulated_torque, _tmp_vec3_1 );
    	_tmp_vec3_1.multiply( this.angular_factor );
    	this.angular_velocity.add( _tmp_vec3_1 );

    	// Apply damping
    	this.linear_velocity.scale( Math.pow( 1 - this.linear_damping, timestep ) );
    	this.angular_velocity.scale( Math.pow( 1 - this.angular_damping, timestep ) );

    	// Update position
    	_tmp_vec3_1.scaleVector( this.linear_velocity, timestep );
    	this.position.add( _tmp_vec3_1 );

    	// Update rotation
    	_tmp_quat4_1.x = this.angular_velocity.x * timestep;
    	_tmp_quat4_1.y = this.angular_velocity.y * timestep;
    	_tmp_quat4_1.z = this.angular_velocity.z * timestep;
    	_tmp_quat4_1.w = 0;

    	_tmp_quat4_1.multiply( this.rotation );

    	var half_dt = 0.5;
    	this.rotation.x += half_dt * _tmp_quat4_1.x;
    	this.rotation.y += half_dt * _tmp_quat4_1.y;
    	this.rotation.z += half_dt * _tmp_quat4_1.z;
    	this.rotation.w += half_dt * _tmp_quat4_1.w;
    	this.rotation.normalize();

    	// Clear accumulated forces
    	this.accumulated_force.x = this.accumulated_force.y = this.accumulated_force.z = 0;
    	this.accumulated_torque.x = this.accumulated_torque.y = this.accumulated_torque.z = 0;
    	this.solver_impulse[0] = this.solver_impulse[1] = this.solver_impulse[2] = this.solver_impulse[3] = this.solver_impulse[4] = this.solver_impulse[5] = 0;
    	this.push_velocity.x = this.push_velocity.y = this.push_velocity.z = 0;
    	this.turn_velocity.x = this.turn_velocity.y = this.turn_velocity.z = 0;
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
    		this.gravity.x = x;
    		this.gravity.y = y;
    		this.gravity.z = z;
    	} else {
    		this.gravity = new Goblin.Vector3( x, y, z );
    	}
    };

    /**
     * Directly adds linear velocity to the body
     *
     * @method applyImpulse
     * @param impulse {vec3} linear velocity to add to the body
     */
    Goblin.RigidBody.prototype.applyImpulse = function( impulse ) {
    	_tmp_vec3_1.multiplyVectors( impulse, this.linear_factor );
    	this.linear_velocity.add( _tmp_vec3_1 );
    };

    /**
     * Adds a force to the rigid_body which will be used only for the next integration
     *
     * @method applyForce
     * @param force {vec3} force to apply to the rigid_body
     */
    Goblin.RigidBody.prototype.applyForce = function( force ) {
    	this.accumulated_force.add( force );
    };

    /**
     * Applies the vector `force` at world coordinate `point`
     *
     * @method applyForceAtWorldPoint
     * @param force {vec3} Force to apply
     * @param point {vec3} world coordinates where force originates
     */
    Goblin.RigidBody.prototype.applyForceAtWorldPoint = function( force, point ) {
    	_tmp_vec3_1.copy( point );
    	_tmp_vec3_1.subtract( this.position );
    	_tmp_vec3_1.cross( force );

    	this.accumulated_force.add( force );
    	this.accumulated_torque.add( _tmp_vec3_1 );
    };

    /**
     * Applies vector `force` to body at position `point` in body's frame
     *
     * @method applyForceAtLocalPoint
     * @param force {vec3} Force to apply
     * @param point {vec3} local frame coordinates where force originates
     */
    Goblin.RigidBody.prototype.applyForceAtLocalPoint = function( force, point ) {
    	this.transform.transformVector3Into( point, _tmp_vec3_1 );
    	this.applyForceAtWorldPoint( force, _tmp_vec3_1 );
    };

    Goblin.RigidBody.prototype.getVelocityInLocalPoint = function( point, out ) {
    	if ( this._mass === Infinity ) {
    		out.set( 0, 0, 0 );
    	} else {
    		out.copy( this.angular_velocity );
    		out.cross( point );
    		out.add( this.linear_velocity );
    	}
    };

    /**
     * Sets the rigid body's transformation matrix to the current position and rotation
     *
     * @method updateDerived
     */
    Goblin.RigidBody.prototype.updateDerived = function() {
    	// normalize rotation
    	this.rotation.normalize();

    	// update this.transform and this.transform_inverse
    	this.transform.makeTransform( this.rotation, this.position );
    	this.transform.invertInto( this.transform_inverse );

    	// Update the world frame inertia tensor and inverse
    	if ( this._mass !== Infinity ) {
    		_tmp_mat3_1.fromMatrix4( this.transform_inverse );
    		_tmp_mat3_1.transposeInto( _tmp_mat3_2 );
    		_tmp_mat3_2.multiply( this.inertiaTensor );
    		this.inertiaTensorWorldFrame.multiplyFrom( _tmp_mat3_2, _tmp_mat3_1 );

    		this.inertiaTensorWorldFrame.invertInto( this.inverseInertiaTensorWorldFrame );
    	}

    	// Update AABB
    	this.aabb.transform( this.shape.aabb, this.transform );
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
    	this.force = force || new Goblin.Vector3();

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
    	 * Array of all (current) collision pairs between the broadphases' bodies
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
     * @param body {RigidBody} body to add to the broadphase contact checking
     */
    Goblin.BasicBroadphase.prototype.addBody = function( body ) {
    	this.bodies.push( body );
    };

    /**
     * Removes a body from the broadphase contact checking
     *
     * @method removeBody
     * @param body {RigidBody} body to remove from the broadphase contact checking
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
     * @method update
     */
    Goblin.BasicBroadphase.prototype.update = function() {
    	var i, j,
    		object_a, object_b,
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

    			if( Goblin.CollisionUtils.canBodiesCollide( object_a, object_b ) ) {
    				if ( object_a.aabb.intersects( object_b.aabb ) ) {
    					this.collision_pairs.push( [ object_b, object_a ] );
    				}
    			}
    		}
    	}
    };

    /**
     * Returns an array of objects the given body may be colliding with
     *
     * @method intersectsWith
     * @param object_a {RigidBody}
     * @return Array<RigidBody>
     */
    Goblin.BasicBroadphase.prototype.intersectsWith = function( object_a ) {
    	var i, object_b,
    		bodies_count = this.bodies.length,
    		intersections = [];

    	// Loop over all collision objects and check for overlapping boundary spheres
    	for ( i = 0; i < bodies_count; i++ ) {
    		object_b = this.bodies[i];

    		if ( object_a === object_b ) {
    			continue;
    		}

    		if ( object_a.aabb.intersects( object_b.aabb ) ) {
    			intersections.push( object_b );
    		}
    	}

    	return intersections;
    };

    /**
     * Checks if a ray segment intersects with objects in the world
     *
     * @method rayIntersect
     * @property start {vec3} start point of the segment
     * @property end {vec3{ end point of the segment
     * @return {Array<RayIntersection>} an unsorted array of intersections
     */
    Goblin.BasicBroadphase.prototype.rayIntersect = function( start, end ) {
    	var bodies_count = this.bodies.length,
    		i, body,
    		intersections = [];
    	for ( i = 0; i < bodies_count; i++ ) {
    		body = this.bodies[i];
    		if ( body.aabb.testRayIntersect( start, end ) ) {
    			body.rayIntersect( start, end, intersections );
    		}
    	}

    	return intersections;
    };
    (function(){
    	/**
    	 * @class SAPMarker
    	 * @private
    	 * @param {SAPMarker.TYPES} marker_type
    	 * @param {RigidBody} body
    	 * @param {Number} position
    	 * @constructor
    	 */
    	var SAPMarker = function( marker_type, body, position ) {
    		this.type = marker_type;
    		this.body = body;
    		this.position = position;
    		
    		this.prev = null;
    		this.next = null;
    	};
    	SAPMarker.TYPES = {
    		START: 0,
    		END: 1
    	};

    	var LinkedList = function() {
    		this.first = null;
    		this.last = null;
    	};

    	/**
    	 * Sweep and Prune broadphase
    	 *
    	 * @class SAPBroadphase
    	 * @constructor
    	 */
    	Goblin.SAPBroadphase = function() {
    		/**
    		 * linked list of the start/end markers along the X axis
    		 *
    		 * @property bodies
    		 * @type {SAPMarker<SAPMarker>}
    		 */
    		this.markers_x = new LinkedList();

    		/**
    		 * linked list of the start/end markers along the Y axis
    		 *
    		 * @property bodies
    		 * @type {SAPMarker<SAPMarker>}
    		 */
    		this.markers_y = new LinkedList();

    		/**
    		 * linked list of the start/end markers along the Z axis
    		 *
    		 * @property bodies
    		 * @type {SAPMarker<SAPMarker>}
    		 */
    		this.markers_z = new LinkedList();

    		/**
    		 * maintains count of axis over which two bodies overlap; if count is three, their AABBs touch/penetrate
    		 *
    		 * @type {Object}
    		 */
    		this.overlap_counter = {};

    		/**
    		 * array of all (current) collision pairs between the broadphases' bodies
    		 *
    		 * @property collision_pairs
    		 * @type {Array}
    		 */
    		this.collision_pairs = [];

    		/**
    		 * array of bodies which have been added to the broadphase since the last update
    		 *
    		 * @type {Array<RigidBody>}
    		 */
    		this.pending_bodies = [];
    	};

    	Goblin.SAPBroadphase.prototype = {
    		incrementOverlaps: function( body_a, body_b ) {
    			if( !Goblin.CollisionUtils.canBodiesCollide( body_a, body_b ) ) {
    				return;
    			}

    			var key = body_a.id < body_b.id ? body_a.id + '-' + body_b.id : body_b.id + '-' + body_a.id;

    			if ( !this.overlap_counter.hasOwnProperty( key ) ) {
    				this.overlap_counter[key] = 0;
    			}

    			this.overlap_counter[key]++;

    			if ( this.overlap_counter[key] === 3 ) {
    				// The AABBs are touching, add to potential contacts
    				this.collision_pairs.push([ body_a.id < body_b.id ? body_a : body_b, body_a.id < body_b.id ? body_b : body_a ]);
    			}
    		},

    		decrementOverlaps: function( body_a, body_b ) {
    			var key = body_a.id < body_b.id ? body_a.id + '-' + body_b.id : body_b.id + '-' + body_a.id;

    			if ( !this.overlap_counter.hasOwnProperty( key ) ) {
    				this.overlap_counter[key] = 0;
    			}

    			this.overlap_counter[key]--;

    			if ( this.overlap_counter[key] === 0 ) {
    				delete this.overlap_counter[key];
    			} else if ( this.overlap_counter[key] === 2 ) {
    				// These are no longer touching, remove from potential contacts
    				this.collision_pairs = this.collision_pairs.filter(function( pair ){
    					if ( pair[0] === body_a && pair[1] === body_b ) {
    						return false;
    					}
    					if ( pair[0] === body_b && pair[1] === body_a ) {
    						return false;
    					}
    					return true;
    				});
    			}
    		},

    		/**
    		 * Adds a body to the broadphase for contact checking
    		 *
    		 * @method addBody
    		 * @param body {RigidBody} body to add to the broadphase contact checking
    		 */
    		addBody: function( body ) {
    			this.pending_bodies.push( body );
    		},

    		removeBody: function( body ) {
    			// first, check if the body is pending
    			var pending_index = this.pending_bodies.indexOf( body );
    			if ( pending_index !== -1 ) {
    				this.pending_bodies.splice( pending_index, 1 );
    				return;
    			}

    			// body was already added, find & remove
    			var next, prev;
    			var marker = this.markers_x.first;
    			while ( marker ) {
    				if ( marker.body === body ) {
    					next = marker.next;
    					prev = marker.prev;
    					if ( next != null ) {
    						next.prev = prev;
    						if ( prev != null ) {
    							prev.next = next;
    						}
    					} else {
    						this.markers_x.last = prev;
    					}
    					if ( prev != null ) {
    						prev.next = next;
    						if ( next != null ) {
    							next.prev = prev;
    						}
    					} else {
    						this.markers_x.first = next;
    					}
    				}
    				marker = marker.next;
    			}

    			marker = this.markers_y.first;
    			while ( marker ) {
    				if ( marker.body === body ) {
    					next = marker.next;
    					prev = marker.prev;
    					if ( next != null ) {
    						next.prev = prev;
    						if ( prev != null ) {
    							prev.next = next;
    						}
    					} else {
    						this.markers_y.last = prev;
    					}
    					if ( prev != null ) {
    						prev.next = next;
    						if ( next != null ) {
    							next.prev = prev;
    						}
    					} else {
    						this.markers_y.first = next;
    					}
    				}
    				marker = marker.next;
    			}

    			marker = this.markers_z.first;
    			while ( marker ) {
    				if ( marker.body === body ) {
    					next = marker.next;
    					prev = marker.prev;
    					if ( next != null ) {
    						next.prev = prev;
    						if ( prev != null ) {
    							prev.next = next;
    						}
    					} else {
    						this.markers_z.last = prev;
    					}
    					if ( prev != null ) {
    						prev.next = next;
    						if ( next != null ) {
    							next.prev = prev;
    						}
    					} else {
    						this.markers_z.first = next;
    					}
    				}
    				marker = marker.next;
    			}

    			// remove any collisions
    			this.collision_pairs = this.collision_pairs.filter(function( pair ){
    				if ( pair[0] === body || pair[1] === body ) {
    					return false;
    				}
    				return true;
    			});
    		},

    		insertPending: function() {
    			var body;
    			while ( ( body = this.pending_bodies.pop() ) ) {
    				body.updateDerived();
    				var start_marker_x = new SAPMarker( SAPMarker.TYPES.START, body, body.aabb.min.x ),
    					start_marker_y = new SAPMarker( SAPMarker.TYPES.START, body, body.aabb.min.y ),
    					start_marker_z = new SAPMarker( SAPMarker.TYPES.START, body, body.aabb.min.z ),
    					end_marker_x = new SAPMarker( SAPMarker.TYPES.END, body, body.aabb.max.x ),
    					end_marker_y = new SAPMarker( SAPMarker.TYPES.END, body, body.aabb.max.y ),
    					end_marker_z = new SAPMarker( SAPMarker.TYPES.END, body, body.aabb.max.z );

    				// Insert these markers, incrementing overlap counter
    				this.insert( this.markers_x, start_marker_x );
    				this.insert( this.markers_x, end_marker_x );
    				this.insert( this.markers_y, start_marker_y );
    				this.insert( this.markers_y, end_marker_y );
    				this.insert( this.markers_z, start_marker_z );
    				this.insert( this.markers_z, end_marker_z );
    			}
    		},

    		insert: function( list, marker ) {
    			if ( list.first == null ) {
    				list.first = list.last = marker;
    			} else {
    				// Insert at the end of the list & sort
    				marker.prev = list.last;
    				list.last.next = marker;
    				list.last = marker;
    				this.sort( list, marker );
    			}
    		},

    		sort: function( list, marker ) {
    			var prev;
    			while (
    				marker.prev != null &&
    				(
    					marker.position < marker.prev.position ||
    					( marker.position === marker.prev.position && marker.type === SAPMarker.TYPES.START && marker.prev.type === SAPMarker.TYPES.END )
    				)
    			) {
    				prev = marker.prev;

    				// check if this swap changes overlap counters
    				if ( marker.type !== prev.type ) {
    					if ( marker.type === SAPMarker.TYPES.START ) {
    						// marker is START, moving into an overlap
    						this.incrementOverlaps( marker.body, prev.body );
    					} else {
    						// marker is END, leaving an overlap
    						this.decrementOverlaps( marker.body, prev.body );
    					}
    				}

    				marker.prev = prev.prev;
    				prev.next = marker.next;

    				marker.next = prev;
    				prev.prev = marker;

    				if ( marker.prev == null ) {
    					list.first = marker;
    				} else {
    					marker.prev.next = marker;
    				}
    				if ( prev.next == null ) {
    					list.last = prev;
    				} else {
    					prev.next.prev = prev;
    				}
    			}
    		},

    		/**
    		 * Updates the broadphase's internal representation and current predicted contacts
    		 *
    		 * @method update
    		 */
    		update: function() {
    			this.insertPending();

    			var marker = this.markers_x.first;
    			while ( marker ) {
    				if ( marker.type === SAPMarker.TYPES.START ) {
    					marker.position = marker.body.aabb.min.x;
    				} else {
    					marker.position = marker.body.aabb.max.x;
    				}
    				this.sort( this.markers_x, marker );
    				marker = marker.next;
    			}

    			marker = this.markers_y.first;
    			while ( marker ) {
    				if ( marker.type === SAPMarker.TYPES.START ) {
    					marker.position = marker.body.aabb.min.y;
    				} else {
    					marker.position = marker.body.aabb.max.y;
    				}
    				this.sort( this.markers_y, marker );
    				marker = marker.next;
    			}

    			marker = this.markers_z.first;
    			while ( marker ) {
    				if ( marker.type === SAPMarker.TYPES.START ) {
    					marker.position = marker.body.aabb.min.z;
    				} else {
    					marker.position = marker.body.aabb.max.z;
    				}
    				this.sort( this.markers_z, marker );
    				marker = marker.next;
    			}
    		},

    		/**
    		 * Returns an array of objects the given body may be colliding with
    		 *
    		 * @method intersectsWith
    		 * @param body {RigidBody}
    		 * @return Array<RigidBody>
    		 */
    		intersectsWith: function( body ) {
    			this.addBody( body );
    			this.update();

    			var possibilities = this.collision_pairs.filter(function( pair ){
    				if ( pair[0] === body || pair[1] === body ) {
    					return true;
    				}
    				return false;
    			}).map(function( pair ){
    				return pair[0] === body ? pair[1] : pair[0];
    			});

    			this.removeBody( body );
    			return possibilities;
    		},

    		/**
    		 * Checks if a ray segment intersects with objects in the world
    		 *
    		 * @method rayIntersect
    		 * @property start {vec3} start point of the segment
    		 * @property end {vec3{ end point of the segment
             * @return {Array<RayIntersection>} an unsorted array of intersections
    		 */
    		rayIntersect: function( start, end ) {
    			// It's assumed that raytracing will be performed through a proxy like Goblin.World,
    			// thus that the only time this broadphase cares about updating itself is if an object was added
    			if ( this.pending_bodies.length > 0 ) {
    				this.update();
    			}

    			// This implementation only scans the X axis because the overall process gets slower the more axes you add
    			// thanks JavaScript

    			var active_bodies = {},
    				intersections = [],
    				id_body_map = {},
    				id_intersection_count = {},
    				ordered_start, ordered_end,
    				marker, has_encountered_start,
    				i, body, key, keys;

    			// X axis
    			marker = this.markers_x.first;
    			has_encountered_start = false;
    			active_bodies = {};
    			ordered_start = start.x < end.x ? start.x : end.x;
    			ordered_end = start.x < end.x ? end.x : start.x;
    			while ( marker ) {
    				if ( marker.type === SAPMarker.TYPES.START ) {
    					active_bodies[marker.body.id] = marker.body;
    				}

    				if ( marker.position >= ordered_start ) {
    					if ( has_encountered_start === false ) {
    						has_encountered_start = true;
    						keys = Object.keys( active_bodies );
    						for ( i = 0; i < keys.length; i++ ) {
    							key = keys[i];
    							body = active_bodies[key];
    							if ( body == null ) { // needed because we don't delete but set to null, see below comment
    								continue;
    							}
    							// The next two lines are piss-slow
    							id_body_map[body.id] = body;
    							id_intersection_count[body.id] = id_intersection_count[body.id] ? id_intersection_count[body.id] + 1 : 1;
    						}
    					} else if ( marker.type === SAPMarker.TYPES.START ) {
    						// The next two lines are piss-slow
    						id_body_map[marker.body.id] = marker.body;
    						id_intersection_count[marker.body.id] = id_intersection_count[marker.body.id] ? id_intersection_count[marker.body.id] + 1 : 1;
    					}
    				}

    				if ( marker.type === SAPMarker.TYPES.END ) {
    					active_bodies[marker.body.id] = null; // this is massively faster than deleting the association
    					//delete active_bodies[marker.body.id];
    				}

    				if ( marker.position > ordered_end ) {
    					// no more intersections to find on this axis
    					break;
    				}

    				marker = marker.next;
    			}

    			keys = Object.keys( id_intersection_count );
    			for ( i = 0; i < keys.length; i++ ) {
    				var body_id = keys[i];
    				if ( id_intersection_count[body_id] === 1 ) {
    					if ( id_body_map[body_id].aabb.testRayIntersect( start, end ) ) {
    						id_body_map[body_id].rayIntersect( start, end, intersections );
    					}
    				}
    			}

    			return intersections;
    		}
    	};
    })();
    Goblin.BoxSphere = function( object_a, object_b ) {
    	var sphere = object_a.shape instanceof Goblin.SphereShape ? object_a : object_b,
    		box = object_a.shape instanceof Goblin.SphereShape ? object_b : object_a,
    		contact, distance;

    	// Transform the center of the sphere into box coordinates
    	box.transform_inverse.transformVector3Into( sphere.position, _tmp_vec3_1 );

    	// Early out check to see if we can exclude the contact
    	if ( Math.abs( _tmp_vec3_1.x ) - sphere.shape.radius > box.shape.half_width ||
    		Math.abs( _tmp_vec3_1.y ) - sphere.shape.radius > box.shape.half_height ||
    		Math.abs( _tmp_vec3_1.z ) - sphere.shape.radius > box.shape.half_depth )
    	{
    		return;
    	}

    	// `_tmp_vec3_1` is the center of the sphere in relation to the box
    	// `_tmp_vec3_2` will hold the point on the box closest to the sphere
    	_tmp_vec3_2.x = _tmp_vec3_2.y = _tmp_vec3_2.z = 0;

    	// Clamp each coordinate to the box.
    	distance = _tmp_vec3_1.x;
    	if ( distance > box.shape.half_width ) {
    		distance = box.shape.half_width;
    	} else if (distance < -box.shape.half_width ) {
    		distance = -box.shape.half_width;
    	}
    	_tmp_vec3_2.x = distance;

    	distance = _tmp_vec3_1.y;
    	if ( distance > box.shape.half_height ) {
    		distance = box.shape.half_height;
    	} else if (distance < -box.shape.half_height ) {
    		distance = -box.shape.half_height;
    	}
    	_tmp_vec3_2.y = distance;

    	distance = _tmp_vec3_1.z;
    	if ( distance > box.shape.half_depth ) {
    		distance = box.shape.half_depth;
    	} else if (distance < -box.shape.half_depth ) {
    		distance = -box.shape.half_depth;
    	}
    	_tmp_vec3_2.z = distance;

    	// Check we're in contact
    	_tmp_vec3_3.subtractVectors( _tmp_vec3_2, _tmp_vec3_1 );
    	distance = _tmp_vec3_3.lengthSquared();
    	if ( distance > sphere.shape.radius * sphere.shape.radius ) {
    		return;
    	}

    	// Get a ContactDetails object populate it
    	contact = Goblin.ObjectPool.getObject( 'ContactDetails' );
    	contact.object_a = sphere;
    	contact.object_b = box;

    	if ( distance === 0 ) {

    		// The center of the sphere is contained within the box
    		Goblin.BoxSphere.spherePenetration( box.shape, _tmp_vec3_1, _tmp_vec3_2, contact );

    	} else {

    		// Center of the sphere is outside of the box

    		// Find contact normal and penetration depth
    		contact.contact_normal.subtractVectors( _tmp_vec3_2, _tmp_vec3_1 );
    		contact.penetration_depth = -contact.contact_normal.length();
    		contact.contact_normal.scale( -1 / contact.penetration_depth );

    		// Set contact point of `object_b` (the box )
    		contact.contact_point_in_b.copy( _tmp_vec3_2 );

    	}

    	// Update penetration depth to include sphere's radius
    	contact.penetration_depth += sphere.shape.radius;

    	// Convert contact normal to world coordinates
    	box.transform.rotateVector3( contact.contact_normal );

    	// Contact point in `object_a` (the sphere) is the normal * radius converted to the sphere's frame
    	sphere.transform_inverse.rotateVector3Into( contact.contact_normal, contact.contact_point_in_a );
    	contact.contact_point_in_a.scale( sphere.shape.radius );

    	// Find contact position
    	contact.contact_point.scaleVector( contact.contact_normal, sphere.shape.radius - contact.penetration_depth / 2 );
    	contact.contact_point.add( sphere.position );

    	contact.restitution = ( sphere.restitution + box.restitution ) / 2;
    	contact.friction = ( sphere.friction + box.friction ) / 2;

    	return contact;
    };

    Goblin.BoxSphere.spherePenetration = function( box, sphere_center, box_point, contact ) {
    	var min_distance, face_distance;

    	if ( sphere_center.x < 0 ) {
    		min_distance = box.half_width + sphere_center.x;
    		box_point.x = -box.half_width;
    		box_point.y = box_point.z = 0;
    		contact.penetration_depth = min_distance;
    	} else {
    		min_distance = box.half_width - sphere_center.x;
    		box_point.x = box.half_width;
    		box_point.y = box_point.z = 0;
    		contact.penetration_depth = min_distance;
    	}

    	if ( sphere_center.y < 0 ) {
    		face_distance = box.half_height + sphere_center.y;
    		if ( face_distance < min_distance ) {
    			min_distance = face_distance;
    			box_point.y = -box.half_height;
    			box_point.x = box_point.z = 0;
    			contact.penetration_depth = min_distance;
    		}
    	} else {
    		face_distance = box.half_height - sphere_center.y;
    		if ( face_distance < min_distance ) {
    			min_distance = face_distance;
    			box_point.y = box.half_height;
    			box_point.x = box_point.z = 0;
    			contact.penetration_depth = min_distance;
    		}
    	}

    	if ( sphere_center.z < 0 ) {
    		face_distance = box.half_depth + sphere_center.z;
    		if ( face_distance < min_distance ) {
    			box_point.z = -box.half_depth;
    			box_point.x = box_point.y = 0;
    			contact.penetration_depth = min_distance;
    		}
    	} else {
    		face_distance = box.half_depth - sphere_center.z;
    		if ( face_distance < min_distance ) {
    			box_point.z = box.half_depth;
    			box_point.x = box_point.y = 0;
    			contact.penetration_depth = min_distance;
    		}
    	}

    	// Set contact point of `object_b` (the box)
    	contact.contact_point_in_b.copy( _tmp_vec3_2 );
    	contact.contact_normal.scaleVector( contact.contact_point_in_b, -1 );
    	contact.contact_normal.normalize();
    };
    /**
     * Provides the classes and algorithms for running GJK+EPA based collision detection
     *
     * @class GjkEpa
     * @static
     */
    Goblin.GjkEpa = {
    	margins: 0.01,
    	result: null,

        max_iterations: 20,
        epa_condition: 0.001,

        /**
         * Holds a point on the edge of a Minkowski difference along with that point's witnesses and the direction used to find the point
         *
         * @class SupportPoint
         * @param witness_a {vec3} Point in first object used to find the supporting point
         * @param witness_b {vec3} Point in the second object ued to find th supporting point
         * @param point {vec3} The support point on the edge of the Minkowski difference
         * @constructor
         */
        SupportPoint: function( witness_a, witness_b, point ) {
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
        findSupportPoint: (function(){
            var temp = new Goblin.Vector3();
            return function( object_a, object_b, direction, support_point ) {
                // Find witnesses from the objects
                object_a.findSupportPoint( direction, support_point.witness_a );
                temp.scaleVector( direction, -1 );
                object_b.findSupportPoint( temp, support_point.witness_b );

                // Find the CSO support point
                support_point.point.subtractVectors( support_point.witness_a, support_point.witness_b );
            };
        })(),

    	testCollision: function( object_a, object_b ) {
    		var simplex = Goblin.GjkEpa.GJK( object_a, object_b );
    		if ( Goblin.GjkEpa.result != null ) {
    			return Goblin.GjkEpa.result;
    		} else if ( simplex != null ) {
    			return Goblin.GjkEpa.EPA( simplex );
    		}
    	},

        /**
         * Perform GJK algorithm against two objects. Returns a ContactDetails object if there is a collision, else null
         *
         * @method GJK
         * @param object_a {Goblin.RigidBody}
         * @param object_b {Goblin.RigidBody}
         * @return {Goblin.ContactDetails|Boolean} Returns `null` if no collision, else a `ContactDetails` object
         */
    	GJK: (function(){
            return function( object_a, object_b ) {
                var simplex = new Goblin.GjkEpa.Simplex( object_a, object_b ),
                    last_point;

    			Goblin.GjkEpa.result = null;

                while ( ( last_point = simplex.addPoint() ) ){}

                // If last_point is false then there is no collision
                if ( last_point === false ) {
    				Goblin.GjkEpa.freeSimplex( simplex );
                    return null;
                }

                return simplex;
            };
        })(),

    	freeSimplex: function( simplex ) {
    		// Free the support points used by this simplex
    		for ( var i = 0, points_length = simplex.points.length; i < points_length; i++ ) {
    			Goblin.ObjectPool.freeObject( 'GJK2SupportPoint', simplex.points[i] );
    		}
    	},

    	freePolyhedron: function( polyhedron ) {
    		// Free the support points used by the polyhedron (includes the points from the simplex used to create the polyhedron
    		var pool = Goblin.ObjectPool.pools['GJK2SupportPoint'];

    		for ( var i = 0, faces_length = polyhedron.faces.length; i < faces_length; i++ ) {
    			// The indexOf checking is required because vertices are shared between faces
    			if ( pool.indexOf( polyhedron.faces[i].a ) === -1 ) {
    				Goblin.ObjectPool.freeObject( 'GJK2SupportPoint', polyhedron.faces[i].a );
    			}
    			if ( pool.indexOf( polyhedron.faces[i].b ) === -1 ) {
    				Goblin.ObjectPool.freeObject( 'GJK2SupportPoint', polyhedron.faces[i].b );
    			}
    			if ( pool.indexOf( polyhedron.faces[i].c ) === -1 ) {
    				Goblin.ObjectPool.freeObject( 'GJK2SupportPoint', polyhedron.faces[i].c );
    			}
    		}
    	},

        /**
         * Performs the Expanding Polytope Algorithm a GJK simplex
         *
         * @method EPA
         * @param simplex {Goblin.GjkEpa.Simplex} Simplex generated by the GJK algorithm
         * @return {Goblin.ContactDetails}
         */
        EPA: (function(){
    		var barycentric = new Goblin.Vector3(),
    			confirm = {
    				a: new Goblin.Vector3(),
    				b: new Goblin.Vector3(),
    				c: new Goblin.Vector3()
    			};
    		return function( simplex ) {
                // Time to convert the simplex to real faces
                // @TODO this should be a priority queue where the position in the queue is ordered by distance from face to origin
    			var polyhedron = new Goblin.GjkEpa.Polyhedron( simplex );

    			var i = 0;

                // Expand the polyhedron until it doesn't expand any more
    			while ( ++i ) {
    				polyhedron.findFaceClosestToOrigin();

    				// Find a new support point in the direction of the closest point
    				if ( polyhedron.closest_face_distance < Goblin.EPSILON ) {
    					_tmp_vec3_1.copy( polyhedron.faces[polyhedron.closest_face].normal );
    				} else {
    					_tmp_vec3_1.copy( polyhedron.closest_point );
    				}

    				var support_point = Goblin.ObjectPool.getObject( 'GJK2SupportPoint' );
    				Goblin.GjkEpa.findSupportPoint( simplex.object_a, simplex.object_b, _tmp_vec3_1, support_point );

    				// Check for terminating condition
                    _tmp_vec3_1.subtractVectors( support_point.point, polyhedron.closest_point );
                    var gap = _tmp_vec3_1.lengthSquared();

    				if ( i === Goblin.GjkEpa.max_iterations || ( gap < Goblin.GjkEpa.epa_condition && polyhedron.closest_face_distance > Goblin.EPSILON ) ) {

    					// Get a ContactDetails object and fill out its details
    					var contact = Goblin.ObjectPool.getObject( 'ContactDetails' );
    					contact.object_a = simplex.object_a;
    					contact.object_b = simplex.object_b;

    					contact.contact_normal.normalizeVector( polyhedron.closest_point );
    					if ( contact.contact_normal.lengthSquared() === 0 ) {
    						contact.contact_normal.subtractVectors( contact.object_b.position, contact.object_a.position );
    					}
    					contact.contact_normal.normalize();

    					Goblin.GeometryMethods.findBarycentricCoordinates( polyhedron.closest_point, polyhedron.faces[polyhedron.closest_face].a.point, polyhedron.faces[polyhedron.closest_face].b.point, polyhedron.faces[polyhedron.closest_face].c.point, barycentric );

    					if ( isNaN( barycentric.x ) ) {
                            // @TODO: Avoid this degenerate case
    						//console.log( 'Point not in triangle' );
    						//debugger;
    						Goblin.GjkEpa.freePolyhedron( polyhedron );
    						return null;
    					}

    					// Contact coordinates of object a
    					confirm.a.scaleVector( polyhedron.faces[polyhedron.closest_face].a.witness_a, barycentric.x );
    					confirm.b.scaleVector( polyhedron.faces[polyhedron.closest_face].b.witness_a, barycentric.y );
    					confirm.c.scaleVector( polyhedron.faces[polyhedron.closest_face].c.witness_a, barycentric.z );
    					contact.contact_point_in_a.addVectors( confirm.a, confirm.b );
    					contact.contact_point_in_a.add( confirm.c );

    					// Contact coordinates of object b
    					confirm.a.scaleVector( polyhedron.faces[polyhedron.closest_face].a.witness_b, barycentric.x );
    					confirm.b.scaleVector( polyhedron.faces[polyhedron.closest_face].b.witness_b, barycentric.y );
    					confirm.c.scaleVector( polyhedron.faces[polyhedron.closest_face].c.witness_b, barycentric.z );
    					contact.contact_point_in_b.addVectors( confirm.a, confirm.b );
    					contact.contact_point_in_b.add( confirm.c );

    					// Find actual contact point
    					contact.contact_point.addVectors( contact.contact_point_in_a, contact.contact_point_in_b );
    					contact.contact_point.scale( 0.5  );

    					// Set objects' local points
    					contact.object_a.transform_inverse.transformVector3( contact.contact_point_in_a );
    					contact.object_b.transform_inverse.transformVector3( contact.contact_point_in_b );

    					// Calculate penetration depth
    					contact.penetration_depth = polyhedron.closest_point.length() + Goblin.GjkEpa.margins;

    					contact.restitution = ( simplex.object_a.restitution + simplex.object_b.restitution ) / 2;
    					contact.friction = ( simplex.object_a.friction + simplex.object_b.friction ) / 2;

    					Goblin.GjkEpa.freePolyhedron( polyhedron );

    					return contact;
    				}

                    polyhedron.addVertex( support_point );
    			}

    			Goblin.GjkEpa.freePolyhedron( polyhedron );
                return null;
            };
        })(),

        Face: function( polyhedron, a, b, c ) {
    		this.active = true;
    		//this.polyhedron = polyhedron;
            this.a = a;
            this.b = b;
            this.c = c;
            this.normal = new Goblin.Vector3();
    		this.neighbors = [];

            _tmp_vec3_1.subtractVectors( b.point, a.point );
            _tmp_vec3_2.subtractVectors( c.point, a.point );
            this.normal.crossVectors( _tmp_vec3_1, _tmp_vec3_2 );
            this.normal.normalize();
        }
    };

    Goblin.GjkEpa.Polyhedron = function( simplex ) {
    	this.closest_face = null;
    	this.closest_face_distance = null;
    	this.closest_point = new Goblin.Vector3();

    	this.faces = [
    		//BCD, ACB, CAD, DAB
    		new Goblin.GjkEpa.Face( this, simplex.points[2], simplex.points[1], simplex.points[0] ),
    		new Goblin.GjkEpa.Face( this, simplex.points[3], simplex.points[1], simplex.points[2] ),
    		new Goblin.GjkEpa.Face( this, simplex.points[1], simplex.points[3], simplex.points[0] ),
    		new Goblin.GjkEpa.Face( this, simplex.points[0], simplex.points[3], simplex.points[2] )
    	];

    	this.faces[0].neighbors.push( this.faces[1], this.faces[2], this.faces[3] );
    	this.faces[1].neighbors.push( this.faces[2], this.faces[0], this.faces[3] );
    	this.faces[2].neighbors.push( this.faces[1], this.faces[3], this.faces[0] );
    	this.faces[3].neighbors.push( this.faces[2], this.faces[1], this.faces[0] );
    };
    Goblin.GjkEpa.Polyhedron.prototype = {
        addVertex: function( vertex )
        {
            var edges = [], faces = [], i, j, a, b, last_b;
            this.faces[this.closest_face].silhouette( vertex, edges );

            // Re-order the edges if needed
            for ( i = 0; i < edges.length - 5; i += 5 ) {
                a = edges[i+3];
                b = edges[i+4];

                // Ensure this edge really should be the next one
                if ( i !== 0 && last_b !== a ) {
                    // It shouldn't
                    for ( j = i + 5; j < edges.length; j += 5 ) {
                        if ( edges[j+3] === last_b ) {
                            // Found it
                            var tmp = edges.slice( i, i + 5 );
                            edges[i] = edges[j];
                            edges[i+1] = edges[j+1];
                            edges[i+2] = edges[j+2];
                            edges[i+3] = edges[j+3];
                            edges[i+4] = edges[j+4];
                            edges[j] = tmp[0];
                            edges[j+1] = tmp[1];
                            edges[j+2] = tmp[2];
                            edges[j+3] = tmp[3];
                            edges[j+4] = tmp[4];

                            a = edges[i+3];
                            b = edges[i+4];
                            break;
                        }
                    }
                }
                last_b = b;
            }

            for ( i = 0; i < edges.length; i += 5 ) {
                var neighbor = edges[i];
                a = edges[i+3];
                b = edges[i+4];

                var face = new Goblin.GjkEpa.Face( this, b, vertex, a );
                face.neighbors[2] = edges[i];
                faces.push( face );

                neighbor.neighbors[neighbor.neighbors.indexOf( edges[i+2] )] = face;
            }

            for ( i = 0; i < faces.length; i++ ) {
                faces[i].neighbors[0] = faces[ i + 1 === faces.length ? 0 : i + 1 ];
                faces[i].neighbors[1] = faces[ i - 1 < 0 ? faces.length - 1 : i - 1 ];
            }

    		Array.prototype.push.apply( this.faces, faces );

            return edges;
        },

    	findFaceClosestToOrigin: (function(){
    		var origin = new Goblin.Vector3(),
    			point = new Goblin.Vector3();

    		return function() {
    			this.closest_face_distance = Infinity;

    			var distance, i;

    			for ( i = 0; i < this.faces.length; i++ ) {
    				if ( this.faces[i].active === false ) {
    					continue;
    				}

    				Goblin.GeometryMethods.findClosestPointInTriangle( origin, this.faces[i].a.point, this.faces[i].b.point, this.faces[i].c.point, point );
    				distance = point.lengthSquared();
    				if ( distance < this.closest_face_distance ) {
    					this.closest_face_distance = distance;
    					this.closest_face = i;
    					this.closest_point.copy( point );
    				}
    			}
    		};
    	})()
    };

    Goblin.GjkEpa.Face.prototype = {
    	/**
    	 * Determines if a vertex is in front of or behind the face
    	 *
    	 * @method classifyVertex
    	 * @param vertex {vec3} Vertex to classify
    	 * @return {Number} If greater than 0 then `vertex' is in front of the face
    	 */
    	classifyVertex: function( vertex ) {
    		var w = this.normal.dot( this.a.point );
    		return this.normal.dot( vertex.point ) - w;
    	},

    	silhouette: function( point, edges, source ) {
            if ( this.active === false ) {
                return;
            }

            if ( this.classifyVertex( point ) > 0 ) {
    			// This face is visible from `point`. Deactivate this face and alert the neighbors
    			this.active = false;

    			this.neighbors[0].silhouette( point, edges, this );
    			this.neighbors[1].silhouette( point, edges, this );
                this.neighbors[2].silhouette( point, edges, this );
    		} else if ( source ) {
    			// This face is a neighbor to a now-silhouetted face, determine which neighbor and replace it
    			var neighbor_idx = this.neighbors.indexOf( source ),
                    a, b;
                if ( neighbor_idx === 0 ) {
                    a = this.a;
                    b = this.b;
                } else if ( neighbor_idx === 1 ) {
                    a = this.b;
                    b = this.c;
                } else {
                    a = this.c;
                    b = this.a;
                }
    			edges.push( this, neighbor_idx, source, b, a );
    		}
    	}
    };

    (function(){
        var origin = new Goblin.Vector3(),
    		ao = new Goblin.Vector3(),
            ab = new Goblin.Vector3(),
            ac = new Goblin.Vector3(),
            ad = new Goblin.Vector3();

    	var barycentric = new Goblin.Vector3(),
    		confirm = {
    			a: new Goblin.Vector3(),
    			b: new Goblin.Vector3(),
    			c: new Goblin.Vector3()
    		};

        Goblin.GjkEpa.Simplex = function( object_a, object_b ) {
            this.object_a = object_a;
            this.object_b = object_b;
            this.points = [];
            this.iterations = 0;
            this.next_direction = new Goblin.Vector3();
            this.updateDirection();
        };
        Goblin.GjkEpa.Simplex.prototype = {
            addPoint: function() {
                if ( ++this.iterations === Goblin.GjkEpa.max_iterations ) {
                    return false;
                }

                var support_point = Goblin.ObjectPool.getObject( 'GJK2SupportPoint' );
                Goblin.GjkEpa.findSupportPoint( this.object_a, this.object_b, this.next_direction, support_point );
                this.points.push( support_point );

    			if ( support_point.point.dot( this.next_direction ) < 0 && this.points.length > 1 ) {
    				// Check the margins first
    				// @TODO this can be expanded to support 1-simplex (2 points)
    				if ( this.points.length >= 3 ) {
    					Goblin.GeometryMethods.findClosestPointInTriangle(
    						origin,
    						this.points[0].point,
    						this.points[1].point,
    						this.points[2].point,
    						_tmp_vec3_1
    					);
    					var distanceSquared = _tmp_vec3_1.lengthSquared();

    					if ( distanceSquared <= Goblin.GjkEpa.margins * Goblin.GjkEpa.margins ) {
    						// Get a ContactDetails object and fill out its details
    						var contact = Goblin.ObjectPool.getObject( 'ContactDetails' );
    						contact.object_a = this.object_a;
    						contact.object_b = this.object_b;

    						contact.contact_normal.normalizeVector( _tmp_vec3_1 );
    						if ( contact.contact_normal.lengthSquared() === 0 ) {
    							contact.contact_normal.subtractVectors( contact.object_b.position, contact.object_a.position );
    						}
    						contact.contact_normal.normalize();
    						contact.contact_normal.scale( -1 );

    						contact.penetration_depth = Goblin.GjkEpa.margins - Math.sqrt( distanceSquared );

    						Goblin.GeometryMethods.findBarycentricCoordinates( _tmp_vec3_1, this.points[0].point, this.points[1].point, this.points[2].point, barycentric );

    						if ( isNaN( barycentric.x ) ) {
    							//debugger;
    							return false;
    						}

    						// Contact coordinates of object a
    						confirm.a.scaleVector( this.points[0].witness_a, barycentric.x );
    						confirm.b.scaleVector( this.points[1].witness_a, barycentric.y );
    						confirm.c.scaleVector( this.points[2].witness_a, barycentric.z );
    						contact.contact_point_in_a.addVectors( confirm.a, confirm.b );
    						contact.contact_point_in_a.add( confirm.c );

    						// Contact coordinates of object b
    						contact.contact_point_in_b.scaleVector( contact.contact_normal, -contact.penetration_depth );
    						contact.contact_point_in_b.add( contact.contact_point_in_a );

    						// Find actual contact point
    						contact.contact_point.addVectors( contact.contact_point_in_a, contact.contact_point_in_b );
    						contact.contact_point.scale( 0.5  );

    						// Set objects' local points
    						contact.object_a.transform_inverse.transformVector3( contact.contact_point_in_a );
    						contact.object_b.transform_inverse.transformVector3( contact.contact_point_in_b );

    						contact.restitution = ( this.object_a.restitution + this.object_b.restitution ) / 2;
    						contact.friction = ( this.object_a.friction + this.object_b.friction ) / 2;

    						//Goblin.GjkEpa.freePolyhedron( polyhedron );

    						Goblin.GjkEpa.result = contact;
    						return null;
    					}
    				}

    				// if the last added point was not past the origin in the direction
    				// then the Minkowski difference cannot contain the origin because
    				// point added is past the edge of the Minkowski difference
    				return false;
    			}

                if ( this.updateDirection() === true ) {
                    // Found a collision
                    return null;
                }

                return support_point;
            },

            findDirectionFromLine: function() {
                ao.scaleVector( this.points[1].point, -1 );
                ab.subtractVectors( this.points[0].point, this.points[1].point );

                if ( ab.dot( ao ) < 0 ) {
                    // Origin is on the opposite side of A from B
                    this.next_direction.copy( ao );
    				Goblin.ObjectPool.freeObject( 'GJK2SupportPoint', this.points[1] );
                    this.points.length = 1; // Remove second point
    			} else {
                    // Origin lies between A and B, move on to a 2-simplex
                    this.next_direction.crossVectors( ab, ao );
                    this.next_direction.cross( ab );

                    // In the case that `ab` and `ao` are parallel vectors, direction becomes a 0-vector
                    if (
                        this.next_direction.x === 0 &&
                        this.next_direction.y === 0 &&
                        this.next_direction.z === 0
                    ) {
                        ab.normalize();
                        this.next_direction.x = 1 - Math.abs( ab.x );
                        this.next_direction.y = 1 - Math.abs( ab.y );
                        this.next_direction.z = 1 - Math.abs( ab.z );
                    }
                }
            },

            findDirectionFromTriangle: function() {
                // Triangle
                var a = this.points[2],
                    b = this.points[1],
                    c = this.points[0];

                ao.scaleVector( a.point, -1 ); // ao
                ab.subtractVectors( b.point, a.point ); // ab
                ac.subtractVectors( c.point, a.point ); // ac

                // Determine the triangle's normal
                _tmp_vec3_1.crossVectors( ab, ac );

                // Edge cross products
                _tmp_vec3_2.crossVectors( ab, _tmp_vec3_1 );
                _tmp_vec3_3.crossVectors( _tmp_vec3_1, ac );

                if ( _tmp_vec3_3.dot( ao ) >= 0 ) {
                    // Origin lies on side of ac opposite the triangle
                    if ( ac.dot( ao ) >= 0 ) {
                        // Origin outside of the ac line, so we form a new
                        // 1-simplex (line) with points A and C, leaving B behind
                        this.points.length = 0;
                        this.points.push( c, a );
    					Goblin.ObjectPool.freeObject( 'GJK2SupportPoint', b );

                        // New search direction is from ac towards the origin
                        this.next_direction.crossVectors( ac, ao );
                        this.next_direction.cross( ac );
                    } else {
                        // *
                        if ( ab.dot( ao ) >= 0 ) {
                            // Origin outside of the ab line, so we form a new
                            // 1-simplex (line) with points A and B, leaving C behind
                            this.points.length = 0;
                            this.points.push( b, a );
    						Goblin.ObjectPool.freeObject( 'GJK2SupportPoint', c );

                            // New search direction is from ac towards the origin
                            this.next_direction.crossVectors( ab, ao );
                            this.next_direction.cross( ab );
                        } else {
                            // only A gives us a good reference point, start over with a 0-simplex
                            this.points.length = 0;
                            this.points.push( a );
    						Goblin.ObjectPool.freeObject( 'GJK2SupportPoint', b );
    						Goblin.ObjectPool.freeObject( 'GJK2SupportPoint', c );
                        }
                        // *
                    }

                } else {

                    // Origin lies on the triangle side of ac
                    if ( _tmp_vec3_2.dot( ao ) >= 0 ) {
                        // Origin lies on side of ab opposite the triangle

                        // *
                        if ( ab.dot( ao ) >= 0 ) {
                            // Origin outside of the ab line, so we form a new
                            // 1-simplex (line) with points A and B, leaving C behind
                            this.points.length = 0;
                            this.points.push( b, a );
    						Goblin.ObjectPool.freeObject( 'GJK2SupportPoint', c );

                            // New search direction is from ac towards the origin
                            this.next_direction.crossVectors( ab, ao );
                            this.next_direction.cross( ab );
                        } else {
                            // only A gives us a good reference point, start over with a 0-simplex
                            this.points.length = 0;
                            this.points.push( a );
    						Goblin.ObjectPool.freeObject( 'GJK2SupportPoint', b );
    						Goblin.ObjectPool.freeObject( 'GJK2SupportPoint', c );
                        }
                        // *

                    } else {

                        // Origin lies somewhere in the triangle or above/below it
                        if ( _tmp_vec3_1.dot( ao ) >= 0 ) {
                            // Origin is on the front side of the triangle
                            this.next_direction.copy( _tmp_vec3_1 );
    						this.points.length = 0;
    						this.points.push( a, b, c );
                        } else {
                            // Origin is on the back side of the triangle
                            this.next_direction.copy( _tmp_vec3_1 );
                            this.next_direction.scale( -1 );
                        }

                    }

                }
            },

            getFaceNormal: function( a, b, c, destination ) {
                ab.subtractVectors( b.point, a.point );
                ac.subtractVectors( c.point, a.point );
                destination.crossVectors( ab, ac );
                destination.normalize();
            },

            faceNormalDotOrigin: function( a, b, c ) {
                // Find face normal
                this.getFaceNormal( a, b, c, _tmp_vec3_1 );

                // Find direction of origin from center of face
                _tmp_vec3_2.addVectors( a.point, b.point );
                _tmp_vec3_2.add( c.point );
    			_tmp_vec3_2.scale( -3 );
    			_tmp_vec3_2.normalize();

                return _tmp_vec3_1.dot( _tmp_vec3_2 );
            },

            findDirectionFromTetrahedron: function() {
                var a = this.points[3],
                    b = this.points[2],
                    c = this.points[1],
                    d = this.points[0];

    			// Check each of the four sides to see which one is facing the origin.
    			// Then keep the three points for that triangle and use its normal as the search direction
    			// The four faces are BCD, ACB, CAD, DAB
    			var closest_face = null,
    				closest_dot = Goblin.EPSILON,
    				face_dot;

    			// @TODO we end up calculating the "winning" face normal twice, don't do that

    			face_dot = this.faceNormalDotOrigin( b, c, d );
    			if ( face_dot > closest_dot ) {
    				closest_face = 1;
    				closest_dot = face_dot;
    			}

    			face_dot = this.faceNormalDotOrigin( a, c, b );
    			if ( face_dot > closest_dot ) {
    				closest_face = 2;
    				closest_dot = face_dot;
    			}

    			face_dot = this.faceNormalDotOrigin( c, a, d );
    			if ( face_dot > closest_dot ) {
    				closest_face = 3;
    				closest_dot = face_dot;
    			}

    			face_dot = this.faceNormalDotOrigin( d, a, b );
    			if ( face_dot > closest_dot ) {
    				closest_face = 4;
    				closest_dot = face_dot;
    			}

    			if ( closest_face === null ) {
    				// We have a collision, ready for EPA
    				return true;
    			} else if ( closest_face === 1 ) {
    				// BCD
    				this.points.length = 0;
    				this.points.push( b, c, d );
    				this.getFaceNormal( b, c, d, _tmp_vec3_1 );
    				this.next_direction.copy( _tmp_vec3_1 );
    			} else if ( closest_face === 2 ) {
    				// ACB
    				this.points.length = 0;
    				this.points.push( a, c, b );
    				this.getFaceNormal( a, c, b, _tmp_vec3_1 );
    				this.next_direction.copy( _tmp_vec3_1 );
    			} else if ( closest_face === 3 ) {
    				// CAD
    				this.points.length = 0;
    				this.points.push( c, a, d );
    				this.getFaceNormal( c, a, d, _tmp_vec3_1 );
    				this.next_direction.copy( _tmp_vec3_1 );
    			} else if ( closest_face === 4 ) {
    				// DAB
    				this.points.length = 0;
    				this.points.push( d, a, b );
    				this.getFaceNormal( d, a, b, _tmp_vec3_1 );
    				this.next_direction.copy( _tmp_vec3_1 );
    			}
            },

            containsOrigin: function() {
    			var a = this.points[3],
                    b = this.points[2],
                    c = this.points[1],
                    d = this.points[0];

                // Check DCA
                ab.subtractVectors( d.point, a.point );
                ad.subtractVectors( c.point, a.point );
                _tmp_vec3_1.crossVectors( ab, ad );
                if ( _tmp_vec3_1.dot( a.point ) > 0 ) {
                    return false;
                }

                // Check CBA
                ab.subtractVectors( c.point, a.point );
                ad.subtractVectors( b.point, a.point );
                _tmp_vec3_1.crossVectors( ab, ad );
                if ( _tmp_vec3_1.dot( a.point ) > 0 ) {
                    return false;
                }

                // Check ADB
                ab.subtractVectors( b.point, a.point );
                ad.subtractVectors( d.point, a.point );
                _tmp_vec3_1.crossVectors( ab, ad );
                if ( _tmp_vec3_1.dot( a.point ) > 0 ) {
                    return false;
                }

                // Check DCB
                ab.subtractVectors( d.point, c.point );
                ad.subtractVectors( b.point, c.point );
                _tmp_vec3_1.crossVectors( ab, ad );
                if ( _tmp_vec3_1.dot( d.point ) > 0 ) {
                    return false;
                }

                return true;
            },

            updateDirection: function() {
                if ( this.points.length === 0 ) {

                    this.next_direction.subtractVectors( this.object_b.position, this.object_a.position );

                } else if ( this.points.length === 1 ) {

                    this.next_direction.scale( -1 );

                } else if ( this.points.length === 2 ) {

                    this.findDirectionFromLine();

                } else if ( this.points.length === 3 ) {

                    this.findDirectionFromTriangle();

                } else {

                    return this.findDirectionFromTetrahedron();

                }
            }
        };
    })();

    Goblin.SphereSphere = function( object_a, object_b ) {
    	// Cache positions of the spheres
    	var position_a = object_a.position,
    		position_b = object_b.position;

    	// Get the vector between the two objects
    	_tmp_vec3_1.subtractVectors( position_b, position_a );
    	var distance = _tmp_vec3_1.length();

    	// If the distance between the objects is greater than their combined radii
    	// then they are not touching, continue processing the other possible contacts
    	if ( distance > object_a.shape.radius + object_b.shape.radius ) {
    		return;
    	}

    	// Get a ContactDetails object and fill out it's information
    	var contact = Goblin.ObjectPool.getObject( 'ContactDetails' );
    	contact.object_a = object_a;
    	contact.object_b = object_b;

    	// Because we already have the distance (vector magnitude), don't normalize
    	// instead we will calculate this value manually
    	contact.contact_normal.scaleVector( _tmp_vec3_1, 1 / distance );

    	// Calculate contact position
    	_tmp_vec3_1.scale( -0.5  );
    	contact.contact_point.addVectors( _tmp_vec3_1, position_a );

    	// Calculate penetration depth
    	contact.penetration_depth = object_a.shape.radius + object_b.shape.radius - distance;

    	// Contact points in both objects - in world coordinates at first
    	contact.contact_point_in_a.scaleVector( contact.contact_normal, contact.object_a.shape.radius );
    	contact.contact_point_in_a.add( contact.object_a.position );
    	contact.contact_point_in_b.scaleVector( contact.contact_normal, -contact.object_b.shape.radius );
    	contact.contact_point_in_b.add( contact.object_b.position );

    	// Find actual contact point
    	contact.contact_point.addVectors( contact.contact_point_in_a, contact.contact_point_in_b );
    	contact.contact_point.scale( 0.5 );

    	// Convert contact_point_in_a and contact_point_in_b to those objects' local frames
    	contact.object_a.transform_inverse.transformVector3( contact.contact_point_in_a );
    	contact.object_b.transform_inverse.transformVector3( contact.contact_point_in_b );

    	contact.restitution = ( object_a.restitution + object_b.restitution ) / 2;
    	contact.friction = ( object_a.friction + object_b.friction ) / 2;

    	return contact;
    };
    /**
     * Performs an intersection test between two triangles
     *
     * @method TriangleTriangle
     * @param tri_a {TriangleShape}
     * @param tri_b {TriangleShape}
     */
    Goblin.TriangleTriangle = function( tri_a, tri_b ) {
    	var dv1_0 = tri_b.classifyVertex( tri_a.a ),
    		dv1_1 = tri_b.classifyVertex( tri_a.b ),
    		dv1_2 = tri_b.classifyVertex( tri_a.c );

    	if (
    		(dv1_0 > 0 && dv1_1 > 0 && dv1_2 > 0 ) ||
    		(dv1_0 < 0 && dv1_1 < 0 && dv1_2 < 0 )
    	)
    	{
    		// All vertices of tri_a are on the same side of tri_b, no intersection possible
    		return null;
    	}

    	var dv2_0 = tri_a.classifyVertex( tri_b.a ),
    		dv2_1 = tri_a.classifyVertex( tri_b.b ),
    		dv2_2 = tri_a.classifyVertex( tri_b.c );
    	if (
    		( dv2_0 > 0 && dv2_1 > 0 && dv2_2 > 0 ) ||
    		( dv2_0 < 0 && dv2_1 < 0 && dv2_2 < 0 )
    		)
    	{
    		// All vertices of tri_b are on the same side of tri_a, no intersection possible
    		return null;
    	}

    	var d = new Goblin.Vector3();
    	d.crossVectors( tri_a.normal, tri_b.normal );
    	d.normalize();

    	var pv1_0 = d.dot( tri_a.a ),
    		pv1_1 = d.dot( tri_a.b ),
    		pv1_2 = d.dot( tri_a.c ),
    		pv2_0 = d.dot( tri_b.a ),
    		pv2_1 = d.dot( tri_b.b ),
    		pv2_2 = d.dot( tri_b.c );

    	var aa = tri_a.a,
    		ab = tri_a.b,
    		ac = tri_a.c,
    		ba = tri_b.a,
    		bb = tri_b.b,
    		bc = tri_b.c;

    	var tmp;
    	if ( Math.sign( dv1_0 ) === Math.sign( dv1_1 ) ) {
    		tmp = dv1_0;
    		dv1_0 = dv1_2;
    		dv1_2 = tmp;

    		tmp = pv1_0;
    		pv1_0 = pv1_2;
    		pv1_2 = tmp;

    		tmp = aa;
    		aa = ac;
    		ac = tmp;
    	} else if ( Math.sign( dv1_0 ) === Math.sign( dv1_2 ) ) {
    		tmp = dv1_0;
    		dv1_0 = dv1_1;
    		dv1_1 = tmp;

    		tmp = pv1_0;
    		pv1_0 = pv1_1;
    		pv1_1 = tmp;

    		tmp = aa;
    		aa = ab;
    		ab = tmp;
    	}

    	if ( Math.sign( dv2_0 ) === Math.sign( dv2_1 ) ) {
    		tmp = dv2_0;
    		dv2_0 = dv2_2;
    		dv2_2 = tmp;

    		tmp = pv2_0;
    		pv2_0 = pv2_2;
    		pv2_2 = tmp;

    		tmp = ba;
    		ba = bc;
    		bc = tmp;
    	} else if ( Math.sign( dv2_0 ) === Math.sign( dv2_2 ) ) {
    		tmp = dv2_0;
    		dv2_0 = dv2_1;
    		dv2_1 = tmp;

    		tmp = pv2_0;
    		pv2_0 = pv2_1;
    		pv2_1 = tmp;

    		tmp = ba;
    		ba = bb;
    		bb = tmp;
    	}

    	var a_t1 = pv1_0 + ( pv1_1 - pv1_0 ) * ( dv1_0 / ( dv1_0 - dv1_1 ) ),
    		a_t2 = pv1_0 + ( pv1_2 - pv1_0 ) * ( dv1_0 / ( dv1_0 - dv1_2 ) ),
    		b_t1 = pv2_0 + ( pv2_1 - pv2_0 ) * ( dv2_0 / ( dv2_0 - dv2_1 ) ),
    		b_t2 = pv2_0 + ( pv2_2 - pv2_0 ) * ( dv2_0 / ( dv2_0 - dv2_2 ) );

    	if ( a_t1 > a_t2 ) {
    		tmp = a_t1;
    		a_t1 = a_t2;
    		a_t2 = tmp;

    		tmp = pv1_1;
    		pv1_1 = pv1_2;
    		pv1_2 = tmp;

    		tmp = ab;
    		ab = ac;
    		ac = tmp;
    	}
    	if ( b_t1 > b_t2 ) {
    		tmp = b_t1;
    		b_t1 = b_t2;
    		b_t2 = tmp;

    		tmp = pv2_1;
    		pv2_1 = pv2_2;
    		pv2_2 = tmp;

    		tmp = bb;
    		bb = bc;
    		bc = tmp;
    	}

    	if (
    		( a_t1 >= b_t1 && a_t1 <= b_t2 ) ||
    		( a_t2 >= b_t1 && a_t2 <= b_t2 ) ||
    		( b_t1 >= a_t1 && b_t1 <= a_t2 ) ||
    		( b_t2 >= a_t1 && b_t2 <= a_t2 )
    	) {
    		//console.log( 'contact' );

    		var contact = Goblin.ObjectPool.getObject( 'ContactDetails' );

    		contact.object_a = tri_a;
    		contact.object_b = tri_b;

            //debugger;

            var best_a_a = new Goblin.Vector3(),
                best_a_b = new Goblin.Vector3(),
                best_a_n = new Goblin.Vector3(),
                best_b_a = new Goblin.Vector3(),
                best_b_b = new Goblin.Vector3(),
                best_b_n = new Goblin.Vector3(),
                has_a = false,
                has_b = false;

            if ( tri_b.classifyVertex( aa ) <= 0 ) {
                // aa is penetrating tri_b
                has_a = true;
                Goblin.GeometryMethods.findClosestPointInTriangle( aa, ba, bb, bc, best_a_b );
                best_a_a.copy( aa );
                best_a_n.copy( tri_b.normal );
                best_a_n.scale( -1 );
            } else {
                if ( a_t1 >= b_t1 && a_t1 <= b_t2 ) {
                    // ab is penetrating tri_b
                    has_a = true;
                    Goblin.GeometryMethods.findClosestPointInTriangle( ab, ba, bb, bc, best_a_b );
                    best_a_a.copy( ab );
                    best_a_n.copy( tri_b.normal );
                    best_a_n.scale( -1 );
                } else if ( a_t2 >= b_t1 && a_t2 <= b_t2 ) {
                    // ac is penetration tri_b
                    has_a = true;
                    Goblin.GeometryMethods.findClosestPointInTriangle( ac, ba, bb, bc, best_a_b );
                    best_a_a.copy( ac );
                    best_a_n.copy( tri_b.normal );
                    best_a_n.scale( -1 );
                }
            }

            if ( tri_a.classifyVertex( ba ) <= 0 ) {
                // ba is penetrating tri_a
                has_b = true;
                Goblin.GeometryMethods.findClosestPointInTriangle( ba, aa, ab, ac, best_b_a );
                best_b_b.copy( ba );
                best_b_n.copy( tri_a.normal );
            } else {
                if ( b_t1 >= a_t1 && b_t1 <= a_t2 ) {
                    // bb is penetrating tri_a
                    has_b = true;
                    Goblin.GeometryMethods.findClosestPointInTriangle( bb, aa, ab, ac, best_b_a );
                    best_b_b.copy( bb );
                    best_b_n.copy( tri_a.normal );
                } else if ( b_t2 >= a_t1 && b_t2 <= a_t2 ) {
                    // bc is penetration tri_a
                    has_b = true;
                    Goblin.GeometryMethods.findClosestPointInTriangle( bc, aa, ab, ac, best_b_a );
                    best_b_b.copy( bc );
                    best_b_n.copy( tri_a.normal );
                }
            }

            _tmp_vec3_1.subtractVectors( best_a_a, best_a_b );
            _tmp_vec3_2.subtractVectors( best_b_a, best_b_b );
            if ( !has_b || ( has_a && _tmp_vec3_1.lengthSquared() < _tmp_vec3_2.lengthSquared() ) ) {
                contact.contact_point_in_a.copy( best_a_a );
                contact.contact_point_in_b.copy( best_a_b );
                contact.contact_normal.copy( best_a_n );
            } else {
                contact.contact_point_in_a.copy( best_b_a );
                contact.contact_point_in_b.copy( best_b_b );
                contact.contact_normal.copy( best_b_n );
            }
            _tmp_vec3_1.subtractVectors( contact.contact_point_in_a, contact.contact_point_in_b );
            contact.penetration_depth = _tmp_vec3_1.length();
            //console.log( 'depth', contact.penetration_depth );
            //console.log( contact.contact_normal );
    		//if (contact.penetration_depth > 1) debugger;



    		contact.contact_point.addVectors( contact.contact_point_in_a, contact.contact_point_in_b );
    		contact.contact_point.scale( 0.5 );

    		/*m = new THREE.Mesh( new THREE.SphereGeometry( 0.05 ), new THREE.MeshBasicMaterial({ color: 0xFF0000 }) );
    		m.position.copy( contact.contact_point_in_a );
    		exampleUtils.scene.add( m );

            m = new THREE.Mesh( new THREE.SphereGeometry( 0.05 ), new THREE.MeshBasicMaterial({ color: 0x0000FF }) );
            m.position.copy( contact.contact_point_in_b );
            exampleUtils.scene.add( m );

            m = new THREE.Mesh( new THREE.SphereGeometry( 0.05 ), new THREE.MeshBasicMaterial({ color: 0x00FF00 }) );
            m.position.copy( contact.contact_point );
            exampleUtils.scene.add( m );*/

    		return contact;
    	}

    	/*var m;
    	_tmp_vec3_1.scaleVector( d, a_t1 / d.length() );
    	m = new THREE.Mesh( new THREE.SphereGeometry( 0.05 ), new THREE.MeshBasicMaterial({ color: 0xDDAAAA }) );
    	m.position.copy( _tmp_vec3_1 );
    	exampleUtils.scene.add( m );

    	_tmp_vec3_1.scaleVector( d, a_t2 / d.length() );
    	m = new THREE.Mesh( new THREE.SphereGeometry( 0.05 ), new THREE.MeshBasicMaterial({ color: 0xDDAAAA }) );
    	m.position.copy( _tmp_vec3_1 );
    	exampleUtils.scene.add( m );

    	_tmp_vec3_1.scaleVector( d, b_t1 / d.length() );
    	m = new THREE.Mesh( new THREE.SphereGeometry( 0.05 ), new THREE.MeshBasicMaterial({ color: 0xAAAADD }) );
    	m.position.copy( _tmp_vec3_1 );
    	exampleUtils.scene.add( m );

    	_tmp_vec3_1.scaleVector( d, b_t2 / d.length() );
    	m = new THREE.Mesh( new THREE.SphereGeometry( 0.05 ), new THREE.MeshBasicMaterial({ color: 0xAAAADD }) );
    	m.position.copy( _tmp_vec3_1 );
    	exampleUtils.scene.add( m );*/

    	return null;
    };

    Goblin.Constraint = function() {
    	this.active = true;

    	this.object_a = null;

    	this.object_b = null;

    	this.limit = new Goblin.ConstraintLimit();

    	this.motor = new Goblin.ConstraintMotor();

    	this.rows = [];

    	this.factor = 1;

    	this.last_impulse = new Goblin.Vector3();

    	this.breaking_threshold = 0;

    	this.listeners = {};
    };
    Goblin.EventEmitter.apply( Goblin.Constraint );

    Goblin.Constraint.prototype.deactivate = function() {
    	this.active = false;
    	this.emit( 'deactivate' );
    };

    Goblin.Constraint.prototype.update = function(){};
    Goblin.ConstraintLimit = function( limit_lower, limit_upper ) {
    	this.erp = 0.3;
    	this.constraint_row = null;

    	this.set( limit_lower, limit_upper );
    };

    Goblin.ConstraintLimit.prototype.set = function( limit_lower, limit_upper ) {
    	this.limit_lower = limit_lower;
    	this.limit_upper = limit_upper;

    	this.enabled = this.limit_lower != null || this.limit_upper != null;
    };

    Goblin.ConstraintLimit.prototype.createConstraintRow = function() {
    	this.constraint_row = Goblin.ConstraintRow.createConstraintRow();
    };
    Goblin.ConstraintMotor = function( torque, max_speed ) {
    	this.constraint_row = null;
    	this.set( torque, max_speed);
    };

    Goblin.ConstraintMotor.prototype.set = function( torque, max_speed ) {
    	this.enabled = torque != null && max_speed != null;
    	this.torque = torque;
    	this.max_speed = max_speed;
    };

    Goblin.ConstraintMotor.prototype.createConstraintRow = function() {
    	this.constraint_row = Goblin.ConstraintRow.createConstraintRow();
    };
    Goblin.ConstraintRow = function() {
    	this.jacobian = new Float64Array( 12 );
    	this.B = new Float64Array( 12 ); // `B` is the jacobian multiplied by the objects' inverted mass & inertia tensors
    	this.D = 0; // Length of the jacobian

    	this.lower_limit = -Infinity;
    	this.upper_limit = Infinity;

    	this.bias = 0;
    	this.multiplier = 0;
    	this.multiplier_cached = 0;
    	this.eta = 0;
    	this.eta_row = new Float64Array( 12 );
    };

    Goblin.ConstraintRow.createConstraintRow = function() {
    	var row =  Goblin.ObjectPool.getObject( 'ConstraintRow' );
    	row.lower_limit = -Infinity;
    	row.upper_limit = Infinity;
    	row.bias = 0;

    	row.jacobian[0] = row.jacobian[1] = row.jacobian[2] =
    	row.jacobian[3] = row.jacobian[4] = row.jacobian[5] =
    	row.jacobian[6] = row.jacobian[7] = row.jacobian[8] =
    	row.jacobian[9] = row.jacobian[10] = row.jacobian[11] = 0;

    	return row;
    };

    Goblin.ConstraintRow.prototype.computeB = function( constraint ) {
    	var invmass;

    	if ( constraint.object_a != null && constraint.object_a._mass !== Infinity ) {
    		invmass = constraint.object_a._mass_inverted;

    		this.B[0] = invmass * this.jacobian[0] * constraint.object_a.linear_factor.x;
    		this.B[1] = invmass * this.jacobian[1] * constraint.object_a.linear_factor.y;
    		this.B[2] = invmass * this.jacobian[2] * constraint.object_a.linear_factor.z;

    		_tmp_vec3_1.x = this.jacobian[3];
    		_tmp_vec3_1.y = this.jacobian[4];
    		_tmp_vec3_1.z = this.jacobian[5];
    		constraint.object_a.inverseInertiaTensorWorldFrame.transformVector3( _tmp_vec3_1 );
    		this.B[3] = _tmp_vec3_1.x * constraint.object_a.angular_factor.x;
    		this.B[4] = _tmp_vec3_1.y * constraint.object_a.angular_factor.y;
    		this.B[5] = _tmp_vec3_1.z * constraint.object_a.angular_factor.z;
    	} else {
    		this.B[0] = this.B[1] = this.B[2] = 0;
    		this.B[3] = this.B[4] = this.B[5] = 0;
    	}

    	if ( constraint.object_b != null && constraint.object_b._mass !== Infinity ) {
    		invmass = constraint.object_b._mass_inverted;
    		this.B[6] = invmass * this.jacobian[6] * constraint.object_b.linear_factor.x;
    		this.B[7] = invmass * this.jacobian[7] * constraint.object_b.linear_factor.y;
    		this.B[8] = invmass * this.jacobian[8] * constraint.object_b.linear_factor.z;

    		_tmp_vec3_1.x = this.jacobian[9];
    		_tmp_vec3_1.y = this.jacobian[10];
    		_tmp_vec3_1.z = this.jacobian[11];
    		constraint.object_b.inverseInertiaTensorWorldFrame.transformVector3( _tmp_vec3_1 );
    		this.B[9] = _tmp_vec3_1.x * constraint.object_b.linear_factor.x;
    		this.B[10] = _tmp_vec3_1.y * constraint.object_b.linear_factor.y;
    		this.B[11] = _tmp_vec3_1.z * constraint.object_b.linear_factor.z;
    	} else {
    		this.B[6] = this.B[7] = this.B[8] = 0;
    		this.B[9] = this.B[10] = this.B[11] = 0;
    	}
    };

    Goblin.ConstraintRow.prototype.computeD = function() {
    	this.D = (
    		this.jacobian[0] * this.B[0] +
    		this.jacobian[1] * this.B[1] +
    		this.jacobian[2] * this.B[2] +
    		this.jacobian[3] * this.B[3] +
    		this.jacobian[4] * this.B[4] +
    		this.jacobian[5] * this.B[5] +
    		this.jacobian[6] * this.B[6] +
    		this.jacobian[7] * this.B[7] +
    		this.jacobian[8] * this.B[8] +
    		this.jacobian[9] * this.B[9] +
    		this.jacobian[10] * this.B[10] +
    		this.jacobian[11] * this.B[11]
    	);
    };

    Goblin.ConstraintRow.prototype.computeEta = function( constraint, time_delta ) {
    	var invmass,
    		inverse_time_delta = 1 / time_delta;

    	if ( constraint.object_a == null || constraint.object_a._mass === Infinity ) {
    		this.eta_row[0] = this.eta_row[1] = this.eta_row[2] = this.eta_row[3] = this.eta_row[4] = this.eta_row[5] = 0;
    	} else {
    		invmass = constraint.object_a._mass_inverted;

    		this.eta_row[0] = ( constraint.object_a.linear_velocity.x + ( invmass * constraint.object_a.accumulated_force.x ) ) * inverse_time_delta;
    		this.eta_row[1] = ( constraint.object_a.linear_velocity.y + ( invmass * constraint.object_a.accumulated_force.y ) ) * inverse_time_delta;
    		this.eta_row[2] = ( constraint.object_a.linear_velocity.z + ( invmass * constraint.object_a.accumulated_force.z ) ) * inverse_time_delta;

    		_tmp_vec3_1.copy( constraint.object_a.accumulated_torque );
    		constraint.object_a.inverseInertiaTensorWorldFrame.transformVector3( _tmp_vec3_1 );
    		this.eta_row[3] = ( constraint.object_a.angular_velocity.x + _tmp_vec3_1.x ) * inverse_time_delta;
    		this.eta_row[4] = ( constraint.object_a.angular_velocity.y + _tmp_vec3_1.y ) * inverse_time_delta;
    		this.eta_row[5] = ( constraint.object_a.angular_velocity.z + _tmp_vec3_1.z ) * inverse_time_delta;
    	}

    	if ( constraint.object_b == null || constraint.object_b._mass === Infinity ) {
    		this.eta_row[6] = this.eta_row[7] = this.eta_row[8] = this.eta_row[9] = this.eta_row[10] = this.eta_row[11] = 0;
    	} else {
    		invmass = constraint.object_b._mass_inverted;

    		this.eta_row[6] = ( constraint.object_b.linear_velocity.x + ( invmass * constraint.object_b.accumulated_force.x ) ) * inverse_time_delta;
    		this.eta_row[7] = ( constraint.object_b.linear_velocity.y + ( invmass * constraint.object_b.accumulated_force.y ) ) * inverse_time_delta;
    		this.eta_row[8] = ( constraint.object_b.linear_velocity.z + ( invmass * constraint.object_b.accumulated_force.z ) ) * inverse_time_delta;

    		_tmp_vec3_1.copy( constraint.object_b.accumulated_torque );
    		constraint.object_b.inverseInertiaTensorWorldFrame.transformVector3( _tmp_vec3_1 );
    		this.eta_row[9] = ( constraint.object_b.angular_velocity.x + _tmp_vec3_1.x ) * inverse_time_delta;
    		this.eta_row[10] = ( constraint.object_b.angular_velocity.y + _tmp_vec3_1.y ) * inverse_time_delta;
    		this.eta_row[11] = ( constraint.object_b.angular_velocity.z + _tmp_vec3_1.z ) * inverse_time_delta;
    	}

    	var jdotv = this.jacobian[0] * this.eta_row[0] +
    		this.jacobian[1] * this.eta_row[1] +
    		this.jacobian[2] * this.eta_row[2] +
    		this.jacobian[3] * this.eta_row[3] +
    		this.jacobian[4] * this.eta_row[4] +
    		this.jacobian[5] * this.eta_row[5] +
    		this.jacobian[6] * this.eta_row[6] +
    		this.jacobian[7] * this.eta_row[7] +
    		this.jacobian[8] * this.eta_row[8] +
    		this.jacobian[9] * this.eta_row[9] +
    		this.jacobian[10] * this.eta_row[10] +
    		this.jacobian[11] * this.eta_row[11];

    	this.eta = ( this.bias * inverse_time_delta ) - jdotv;
    };
    Goblin.ContactConstraint = function() {
    	Goblin.Constraint.call( this );

    	this.contact = null;
    };
    Goblin.ContactConstraint.prototype = Object.create( Goblin.Constraint.prototype );

    Goblin.ContactConstraint.prototype.buildFromContact = function( contact ) {
    	this.object_a = contact.object_a;
    	this.object_b = contact.object_b;
    	this.contact = contact;

    	var self = this;
    	var onDestroy = function() {
    		this.removeListener( 'destroy', onDestroy );
    		self.deactivate();
    	};
    	this.contact.addListener( 'destroy', onDestroy );

    	var row = this.rows[0] || Goblin.ObjectPool.getObject( 'ConstraintRow' );
    	row.lower_limit = 0;
    	row.upper_limit = Infinity;
    	this.rows[0] = row;

    	this.update();
    };

    Goblin.ContactConstraint.prototype.update = function() {
    	var row = this.rows[0];

    	if ( this.object_a == null || this.object_a._mass === Infinity ) {
    		row.jacobian[0] = row.jacobian[1] = row.jacobian[2] = 0;
    		row.jacobian[3] = row.jacobian[4] = row.jacobian[5] = 0;
    	} else {
    		row.jacobian[0] = -this.contact.contact_normal.x;
    		row.jacobian[1] = -this.contact.contact_normal.y;
    		row.jacobian[2] = -this.contact.contact_normal.z;

    		_tmp_vec3_1.subtractVectors( this.contact.contact_point, this.contact.object_a.position );
    		_tmp_vec3_1.cross( this.contact.contact_normal );
    		row.jacobian[3] = -_tmp_vec3_1.x;
    		row.jacobian[4] = -_tmp_vec3_1.y;
    		row.jacobian[5] = -_tmp_vec3_1.z;
    	}

    	if ( this.object_b == null || this.object_b._mass === Infinity ) {
    		row.jacobian[6] = row.jacobian[7] = row.jacobian[8] = 0;
    		row.jacobian[9] = row.jacobian[10] = row.jacobian[11] = 0;
    	} else {
    		row.jacobian[6] = this.contact.contact_normal.x;
    		row.jacobian[7] = this.contact.contact_normal.y;
    		row.jacobian[8] = this.contact.contact_normal.z;

    		_tmp_vec3_1.subtractVectors( this.contact.contact_point, this.contact.object_b.position );
    		_tmp_vec3_1.cross( this.contact.contact_normal );
    		row.jacobian[9] = _tmp_vec3_1.x;
    		row.jacobian[10] = _tmp_vec3_1.y;
    		row.jacobian[11] = _tmp_vec3_1.z;
    	}

    	// Pre-calc error
    	row.bias = 0;

    	// Apply restitution
    	var velocity_along_normal = 0;
    	if ( this.object_a._mass !== Infinity ) {
    		this.object_a.getVelocityInLocalPoint( this.contact.contact_point_in_a, _tmp_vec3_1 );
    		velocity_along_normal += _tmp_vec3_1.dot( this.contact.contact_normal );
    	}
    	if ( this.object_b._mass !== Infinity ) {
    		this.object_b.getVelocityInLocalPoint( this.contact.contact_point_in_b, _tmp_vec3_1 );
    		velocity_along_normal -= _tmp_vec3_1.dot( this.contact.contact_normal );
    	}

    	// Add restitution to bias
    	row.bias += velocity_along_normal * this.contact.restitution;
    };
    Goblin.FrictionConstraint = function() {
    	Goblin.Constraint.call( this );

    	this.contact = null;
    };
    Goblin.FrictionConstraint.prototype = Object.create( Goblin.Constraint.prototype );

    Goblin.FrictionConstraint.prototype.buildFromContact = function( contact ) {
    	this.rows[0] = this.rows[0] || Goblin.ObjectPool.getObject( 'ConstraintRow' );
    	this.rows[1] = this.rows[1] || Goblin.ObjectPool.getObject( 'ConstraintRow' );

    	this.object_a = contact.object_a;
    	this.object_b = contact.object_b;
    	this.contact = contact;

    	var self = this;
    	var onDestroy = function() {
    		this.removeListener( 'destroy', onDestroy );
    		self.deactivate();
    	};
    	this.contact.addListener( 'destroy', onDestroy );

    	this.update();
    };

    Goblin.FrictionConstraint.prototype.update = (function(){
    	var rel_a = new Goblin.Vector3(),
    		rel_b = new Goblin.Vector3(),
    		u1 = new Goblin.Vector3(),
    		u2 = new Goblin.Vector3();

    	return function updateFrictionConstraint() {
    		var row_1 = this.rows[0],
    			row_2 = this.rows[1];

    		// Find the contact point relative to object_a and object_b
    		rel_a.subtractVectors( this.contact.contact_point, this.object_a.position );
    		rel_b.subtractVectors( this.contact.contact_point, this.object_b.position );

    		this.contact.contact_normal.findOrthogonal( u1, u2 );

    		if ( this.object_a == null || this.object_a._mass === Infinity ) {
    			row_1.jacobian[0] = row_1.jacobian[1] = row_1.jacobian[2] = 0;
    			row_1.jacobian[3] = row_1.jacobian[4] = row_1.jacobian[5] = 0;
    			row_2.jacobian[0] = row_2.jacobian[1] = row_2.jacobian[2] = 0;
    			row_2.jacobian[3] = row_2.jacobian[4] = row_2.jacobian[5] = 0;
    		} else {
    			row_1.jacobian[0] = -u1.x;
    			row_1.jacobian[1] = -u1.y;
    			row_1.jacobian[2] = -u1.z;

    			_tmp_vec3_1.crossVectors( rel_a, u1 );
    			row_1.jacobian[3] = -_tmp_vec3_1.x;
    			row_1.jacobian[4] = -_tmp_vec3_1.y;
    			row_1.jacobian[5] = -_tmp_vec3_1.z;

    			row_2.jacobian[0] = -u2.x;
    			row_2.jacobian[1] = -u2.y;
    			row_2.jacobian[2] = -u2.z;

    			_tmp_vec3_1.crossVectors( rel_a, u2 );
    			row_2.jacobian[3] = -_tmp_vec3_1.x;
    			row_2.jacobian[4] = -_tmp_vec3_1.y;
    			row_2.jacobian[5] = -_tmp_vec3_1.z;
    		}

    		if ( this.object_b == null || this.object_b._mass === Infinity ) {
    			row_1.jacobian[6] = row_1.jacobian[7] = row_1.jacobian[8] = 0;
    			row_1.jacobian[9] = row_1.jacobian[10] = row_1.jacobian[11] = 0;
    			row_2.jacobian[6] = row_2.jacobian[7] = row_2.jacobian[8] = 0;
    			row_2.jacobian[9] = row_2.jacobian[10] = row_2.jacobian[11] = 0;
    		} else {
    			row_1.jacobian[6] = u1.x;
    			row_1.jacobian[7] = u1.y;
    			row_1.jacobian[8] = u1.z;

    			_tmp_vec3_1.crossVectors( rel_b, u1 );
    			row_1.jacobian[9] = _tmp_vec3_1.x;
    			row_1.jacobian[10] = _tmp_vec3_1.y;
    			row_1.jacobian[11] = _tmp_vec3_1.z;

    			row_2.jacobian[6] = u2.x;
    			row_2.jacobian[7] = u2.y;
    			row_2.jacobian[8] = u2.z;

    			_tmp_vec3_1.crossVectors( rel_b, u2 );
    			row_2.jacobian[9] = _tmp_vec3_1.x;
    			row_2.jacobian[10] = _tmp_vec3_1.y;
    			row_2.jacobian[11] = _tmp_vec3_1.z;
    		}

    		// Find total velocity between the two bodies along the contact normal
    		this.object_a.getVelocityInLocalPoint( this.contact.contact_point_in_a, _tmp_vec3_1 );

    		// Include accumulated forces
    		if ( this.object_a._mass !== Infinity ) {
    			// accumulated linear velocity
    			_tmp_vec3_1.scaleVector( this.object_a.accumulated_force, 1 / this.object_a._mass );
    			_tmp_vec3_1.add( this.object_a.linear_velocity );

    			// accumulated angular velocity
    			this.object_a.inverseInertiaTensorWorldFrame.transformVector3Into( this.object_a.accumulated_torque, _tmp_vec3_3 );
    			_tmp_vec3_3.add( this.object_a.angular_velocity );

    			_tmp_vec3_3.cross( this.contact.contact_point_in_a );
    			_tmp_vec3_1.add( _tmp_vec3_3 );
    			_tmp_vec3_1.scale( this.object_a._mass );
    		} else {
    			_tmp_vec3_1.set( 0, 0, 0 );
    		}

    		var limit = this.contact.friction * 25;
    		if ( limit < 0 ) {
    			limit = 0;
    		}
    		row_1.lower_limit = row_2.lower_limit = -limit;
    		row_1.upper_limit = row_2.upper_limit = limit;

    		row_1.bias = row_2.bias = 0;

    		this.rows[0] = row_1;
    		this.rows[1] = row_2;
    	};
    })();
    Goblin.HingeConstraint = function( object_a, hinge_a, point_a, object_b, point_b ) {
    	Goblin.Constraint.call( this );

    	this.object_a = object_a;
    	this.hinge_a = hinge_a;
    	this.point_a = point_a;

    	this.initial_quaternion = new Goblin.Quaternion();

    	this.object_b = object_b || null;
    	this.point_b = new Goblin.Vector3();
    	this.hinge_b = new Goblin.Vector3();
    	if ( this.object_b != null ) {
    		this.object_a.rotation.transformVector3Into( this.hinge_a, this.hinge_b );
    		_tmp_quat4_1.invertQuaternion( this.object_b.rotation );
    		_tmp_quat4_1.transformVector3( this.hinge_b );

    		this.point_b = point_b;

    		this.initial_quaternion.multiplyQuaternions( _tmp_quat4_1, this.object_a.rotation );
    	} else {
    		this.object_a.updateDerived(); // Ensure the body's transform is correct
    		this.object_a.rotation.transformVector3Into( this.hinge_a, this.hinge_b );
    		this.object_a.transform.transformVector3Into( this.point_a, this.point_b );
    		this.initial_quaternion.set( this.object_a.rotation.x, this.object_a.rotation.y, this.object_a.rotation.z, this.object_a.rotation.w );
    	}

    	this.erp = 0.1;

    	// Create rows
    	// rows 0,1,2 are the same as point constraint and constrain the objects' positions
    	// rows 3,4 introduce the rotational constraints which constrains angular velocity orthogonal to the hinge axis
    	for ( var i = 0; i < 5; i++ ) {
    		this.rows[i] = Goblin.ConstraintRow.createConstraintRow();
    	}
    };
    Goblin.HingeConstraint.prototype = Object.create( Goblin.Constraint.prototype );

    function removeConstraintLimitRow( constraint ) {
    	if ( constraint.limit.constraint_row != null ) {
    		var row_idx = constraint.rows.indexOf(constraint.limit.constraint_row);
    		constraint.rows.splice(row_idx, 1);
    		constraint.limit.constraint_row = null;
    	}
    }

    function removeConstraintMotorRow( constraint ) {
    	if ( constraint.motor.constraint_row != null ) {
    		var row_idx = constraint.rows.indexOf(constraint.motor.constraint_row);
    		constraint.rows.splice(row_idx, 1);
    		constraint.motor.constraint_row = null;
    	}
    }

    Goblin.HingeConstraint.prototype.updateLimits = function( world_axis, time_delta ) {
    	if ( this.limit.enabled === false ) {
    		// remove existing `constraint_row` if it was previously set
    		removeConstraintLimitRow( this );
    		return;
    	}

    	var separating_angle, correction;

    	if ( this.object_b == null ) {
    		// this.initial_quaternion is the original rotation of object_a
    		separating_angle = this.initial_quaternion.signedAngleBetween( this.object_a.rotation, world_axis );
    	} else {
    		// this.initial_quaternion is the original difference in rotation between object_a and object_b (A - B)
    		_tmp_quat4_1.invertQuaternion( this.object_b.rotation );
    		_tmp_quat4_1.multiply( this.object_a.rotation );

    		separating_angle = this.initial_quaternion.signedAngleBetween( _tmp_quat4_1, world_axis );
    	}

    	if (
    		( this.limit.limit_lower == null || this.limit.limit_lower < separating_angle ) &&
    		( this.limit.limit_upper == null || this.limit.limit_upper > separating_angle )
    	) {
    		// there limit is not violated, ignore
    		removeConstraintLimitRow( this );
    		return;
    	}

    	if ( this.limit.limit_lower != null && separating_angle <= this.limit.limit_lower ) {
    		if ( this.limit.constraint_row == null ) {
    			this.limit.createConstraintRow();
    			this.limit.constraint_row.upper_limit = 0;
    			this.rows.push( this.limit.constraint_row );
    		}
    		this.limit.constraint_row.jacobian[3] = -world_axis.x;
    		this.limit.constraint_row.jacobian[4] = -world_axis.y;
    		this.limit.constraint_row.jacobian[5] = -world_axis.z;

    		if ( this.object_b != null ) {
    			this.limit.constraint_row.jacobian[9] = world_axis.x;
    			this.limit.constraint_row.jacobian[10] = world_axis.y;
    			this.limit.constraint_row.jacobian[11] = world_axis.z;
    		}

    		correction = separating_angle - this.limit.limit_lower;
    		this.limit.constraint_row.bias = correction * this.limit.erp / time_delta;
    	} else if ( this.limit.limit_upper != null && separating_angle >= this.limit.limit_upper ) {
    		if ( this.limit.constraint_row == null ) {
    			this.limit.createConstraintRow();
    			this.limit.constraint_row.lower_limit = 0;
    			this.rows.push( this.limit.constraint_row );
    		}
    		this.limit.constraint_row.jacobian[3] = -world_axis.x;
    		this.limit.constraint_row.jacobian[4] = -world_axis.y;
    		this.limit.constraint_row.jacobian[5] = -world_axis.z;

    		if ( this.object_b != null ) {
    			this.limit.constraint_row.jacobian[9] = world_axis.x;
    			this.limit.constraint_row.jacobian[10] = world_axis.y;
    			this.limit.constraint_row.jacobian[11] = world_axis.z;
    		}

    		correction = separating_angle - this.limit.limit_upper;
    		this.limit.constraint_row.bias = correction * this.limit.erp / time_delta;
    	}
    };

    Goblin.HingeConstraint.prototype.updateMotor = function( world_axis ) {
    	if ( this.motor.enabled === false ) {
    		removeConstraintMotorRow( this );
    		return;
    	}

    	if ( this.motor.constraint_row == null ) {
    		this.motor.createConstraintRow();
    		this.rows.push( this.motor.constraint_row );
    		this.motor.constraint_row.jacobian[3] = world_axis.x;
    		this.motor.constraint_row.jacobian[4] = world_axis.y;
    		this.motor.constraint_row.jacobian[5] = world_axis.z;

    		if ( this.object_b != null ) {
    			this.motor.constraint_row.jacobian[9] = -world_axis.x;
    			this.motor.constraint_row.jacobian[10] = -world_axis.y;
    			this.motor.constraint_row.jacobian[11] = -world_axis.z;
    		}
    	}

    	this.motor.constraint_row.bias = this.motor.max_speed;
    	if ( this.motor.max_speed >= 0 ) {
    		this.motor.constraint_row.lower_limit = 0;
    		this.motor.constraint_row.upper_limit = this.motor.torque;
    	} else {
    		this.motor.constraint_row.lower_limit = -this.motor.torque;
    		this.motor.constraint_row.upper_limit = 0;
    	}
    };

    Goblin.HingeConstraint.prototype.update = (function(){
    	var r1 = new Goblin.Vector3(),
    		r2 = new Goblin.Vector3(),
    		t1 = new Goblin.Vector3(),
    		t2 = new Goblin.Vector3(),
    		world_axis = new Goblin.Vector3();

    	return function( time_delta ) {
    		this.object_a.rotation.transformVector3Into( this.hinge_a, world_axis );

    		this.object_a.transform.transformVector3Into( this.point_a, _tmp_vec3_1 );
    		r1.subtractVectors( _tmp_vec3_1, this.object_a.position );

    		// 0,1,2 are positional, same as PointConstraint
    		this.rows[0].jacobian[0] = -1;
    		this.rows[0].jacobian[1] = 0;
    		this.rows[0].jacobian[2] = 0;
    		this.rows[0].jacobian[3] = 0;
    		this.rows[0].jacobian[4] = -r1.z;
    		this.rows[0].jacobian[5] = r1.y;

    		this.rows[1].jacobian[0] = 0;
    		this.rows[1].jacobian[1] = -1;
    		this.rows[1].jacobian[2] = 0;
    		this.rows[1].jacobian[3] = r1.z;
    		this.rows[1].jacobian[4] = 0;
    		this.rows[1].jacobian[5] = -r1.x;

    		this.rows[2].jacobian[0] = 0;
    		this.rows[2].jacobian[1] = 0;
    		this.rows[2].jacobian[2] = -1;
    		this.rows[2].jacobian[3] = -r1.y;
    		this.rows[2].jacobian[4] = r1.x;
    		this.rows[2].jacobian[5] = 0;

    		// 3,4 are rotational, constraining motion orthogonal to axis
    		world_axis.findOrthogonal( t1, t2 );
    		this.rows[3].jacobian[3] = -t1.x;
    		this.rows[3].jacobian[4] = -t1.y;
    		this.rows[3].jacobian[5] = -t1.z;

    		this.rows[4].jacobian[3] = -t2.x;
    		this.rows[4].jacobian[4] = -t2.y;
    		this.rows[4].jacobian[5] = -t2.z;

    		if ( this.object_b != null ) {
    			this.object_b.transform.transformVector3Into( this.point_b, _tmp_vec3_2 );
    			r2.subtractVectors( _tmp_vec3_2, this.object_b.position );

    			// 0,1,2 are positional, same as PointConstraint
    			this.rows[0].jacobian[6] = 1;
    			this.rows[0].jacobian[7] = 0;
    			this.rows[0].jacobian[8] = 0;
    			this.rows[0].jacobian[9] = 0;
    			this.rows[0].jacobian[10] = r2.z;
    			this.rows[0].jacobian[11] = -r2.y;

    			this.rows[1].jacobian[6] = 0;
    			this.rows[1].jacobian[7] = 1;
    			this.rows[1].jacobian[8] = 0;
    			this.rows[1].jacobian[9] = -r2.z;
    			this.rows[1].jacobian[10] = 0;
    			this.rows[1].jacobian[11] = r2.x;

    			this.rows[2].jacobian[6] = 0;
    			this.rows[2].jacobian[7] = 0;
    			this.rows[2].jacobian[8] = 1;
    			this.rows[2].jacobian[9] = r2.y;
    			this.rows[2].jacobian[10] = -r2.z;
    			this.rows[2].jacobian[11] = 0;

    			// 3,4 are rotational, constraining motion orthogonal to axis
    			this.rows[3].jacobian[9] = t1.x;
    			this.rows[3].jacobian[10] = t1.y;
    			this.rows[3].jacobian[11] = t1.z;

    			this.rows[4].jacobian[9] = t2.x;
    			this.rows[4].jacobian[10] = t2.y;
    			this.rows[4].jacobian[11] = t2.z;
    		} else {
    			_tmp_vec3_2.copy( this.point_b );
    		}

    		// Linear error correction
    		_tmp_vec3_3.subtractVectors( _tmp_vec3_1, _tmp_vec3_2 );
    		_tmp_vec3_3.scale( this.erp / time_delta );
    		this.rows[0].bias = _tmp_vec3_3.x;
    		this.rows[1].bias = _tmp_vec3_3.y;
    		this.rows[2].bias = _tmp_vec3_3.z;

    		// Angular error correction
    		if (this.object_b != null) {
    			this.object_a.rotation.transformVector3Into(this.hinge_a, _tmp_vec3_1);
    			this.object_b.rotation.transformVector3Into(this.hinge_b, _tmp_vec3_2);
    			_tmp_vec3_1.cross(_tmp_vec3_2);
    			this.rows[3].bias = -_tmp_vec3_1.dot(t1) * this.erp / time_delta;
    			this.rows[4].bias = -_tmp_vec3_1.dot(t2) * this.erp / time_delta;
    		} else {
    			this.rows[3].bias = this.rows[4].bias = 0;
    		}

    		// limits & motor
    		this.updateLimits( world_axis, time_delta );
    		this.updateMotor( world_axis );
    	};
    })( );
    Goblin.PointConstraint = function( object_a, point_a, object_b, point_b ) {
    	Goblin.Constraint.call( this );

    	this.object_a = object_a;
    	this.point_a = point_a;

    	this.object_b = object_b || null;
    	if ( this.object_b != null ) {
    		this.point_b = point_b;
    	} else {
    		this.point_b = new Goblin.Vector3();
    		this.object_a.updateDerived(); // Ensure the body's transform is correct
    		this.object_a.transform.transformVector3Into( this.point_a, this.point_b );
    	}

    	this.erp = 0.1;

    	// Create rows
    	for ( var i = 0; i < 3; i++ ) {
    		this.rows[i] = Goblin.ObjectPool.getObject( 'ConstraintRow' );
    		this.rows[i].lower_limit = -Infinity;
    		this.rows[i].upper_limit = Infinity;
    		this.rows[i].bias = 0;

    		this.rows[i].jacobian[6] = this.rows[i].jacobian[7] = this.rows[i].jacobian[8] =
    			this.rows[i].jacobian[9] = this.rows[i].jacobian[10] = this.rows[i].jacobian[11] = 0;
    	}
    };
    Goblin.PointConstraint.prototype = Object.create( Goblin.Constraint.prototype );

    Goblin.PointConstraint.prototype.update = (function(){
    	var r1 = new Goblin.Vector3(),
    		r2 = new Goblin.Vector3();

    	return function( time_delta ) {
    		this.object_a.transform.transformVector3Into( this.point_a, _tmp_vec3_1 );
    		r1.subtractVectors( _tmp_vec3_1, this.object_a.position );

    		this.rows[0].jacobian[0] = -1;
    		this.rows[0].jacobian[1] = 0;
    		this.rows[0].jacobian[2] = 0;
    		this.rows[0].jacobian[3] = 0;
    		this.rows[0].jacobian[4] = -r1.z;
    		this.rows[0].jacobian[5] = r1.y;

    		this.rows[1].jacobian[0] = 0;
    		this.rows[1].jacobian[1] = -1;
    		this.rows[1].jacobian[2] = 0;
    		this.rows[1].jacobian[3] = r1.z;
    		this.rows[1].jacobian[4] = 0;
    		this.rows[1].jacobian[5] = -r1.x;

    		this.rows[2].jacobian[0] = 0;
    		this.rows[2].jacobian[1] = 0;
    		this.rows[2].jacobian[2] = -1;
    		this.rows[2].jacobian[3] = -r1.y;
    		this.rows[2].jacobian[4] = r1.x;
    		this.rows[2].jacobian[5] = 0;

    		if ( this.object_b != null ) {
    			this.object_b.transform.transformVector3Into( this.point_b, _tmp_vec3_2 );
    			r2.subtractVectors( _tmp_vec3_2, this.object_b.position );

    			this.rows[0].jacobian[6] = 1;
    			this.rows[0].jacobian[7] = 0;
    			this.rows[0].jacobian[8] = 0;
    			this.rows[0].jacobian[9] = 0;
    			this.rows[0].jacobian[10] = r2.z;
    			this.rows[0].jacobian[11] = -r2.y;

    			this.rows[1].jacobian[6] = 0;
    			this.rows[1].jacobian[7] = 1;
    			this.rows[1].jacobian[8] = 0;
    			this.rows[1].jacobian[9] = -r2.z;
    			this.rows[1].jacobian[10] = 0;
    			this.rows[1].jacobian[11] = r2.x;

    			this.rows[2].jacobian[6] = 0;
    			this.rows[2].jacobian[7] = 0;
    			this.rows[2].jacobian[8] = 1;
    			this.rows[2].jacobian[9] = r2.y;
    			this.rows[2].jacobian[10] = -r2.x;
    			this.rows[2].jacobian[11] = 0;
    		} else {
    			_tmp_vec3_2.copy( this.point_b );
    		}

    		_tmp_vec3_3.subtractVectors( _tmp_vec3_1, _tmp_vec3_2 );
    		_tmp_vec3_3.scale( this.erp / time_delta );
    		this.rows[0].bias = _tmp_vec3_3.x;
    		this.rows[1].bias = _tmp_vec3_3.y;
    		this.rows[2].bias = _tmp_vec3_3.z;
    	};
    })( );

    Goblin.SliderConstraint = function( object_a, axis, object_b ) {
    	Goblin.Constraint.call( this );

    	this.object_a = object_a;
    	this.axis = axis;
    	this.object_b = object_b;

    	// Find the initial distance between the two objects in object_a's local frame
    	this.position_error = new Goblin.Vector3();
    	this.position_error.subtractVectors( this.object_b.position, this.object_a.position );
    	_tmp_quat4_1.invertQuaternion( this.object_a.rotation );
    	_tmp_quat4_1.transformVector3( this.position_error );

    	this.rotation_difference = new Goblin.Quaternion();
    	if ( this.object_b != null ) {
    		_tmp_quat4_1.invertQuaternion( this.object_b.rotation );
    		this.rotation_difference.multiplyQuaternions( _tmp_quat4_1, this.object_a.rotation );
    	}

    	this.erp = 0.1;

    	// First two rows constrain the linear velocities orthogonal to `axis`
    	// Rows three through five constrain angular velocities
    	for ( var i = 0; i < 5; i++ ) {
    		this.rows[i] = Goblin.ObjectPool.getObject( 'ConstraintRow' );
    		this.rows[i].lower_limit = -Infinity;
    		this.rows[i].upper_limit = Infinity;
    		this.rows[i].bias = 0;

    		this.rows[i].jacobian[0] = this.rows[i].jacobian[1] = this.rows[i].jacobian[2] =
    			this.rows[i].jacobian[3] = this.rows[i].jacobian[4] = this.rows[i].jacobian[5] =
    			this.rows[i].jacobian[6] = this.rows[i].jacobian[7] = this.rows[i].jacobian[8] =
    			this.rows[i].jacobian[9] = this.rows[i].jacobian[10] = this.rows[i].jacobian[11] = 0;
    	}
    };
    Goblin.SliderConstraint.prototype = Object.create( Goblin.Constraint.prototype );

    Goblin.SliderConstraint.prototype.update = (function(){
    	var _axis = new Goblin.Vector3(),
    		n1 = new Goblin.Vector3(),
    		n2 = new Goblin.Vector3();

    	return function( time_delta ) {
    		// `axis` is in object_a's local frame, convert to world
    		this.object_a.rotation.transformVector3Into( this.axis, _axis );

    		// Find two vectors that are orthogonal to `axis`
    		_axis.findOrthogonal( n1, n2 );

    		this._updateLinearConstraints( time_delta, n1, n2 );
    		this._updateAngularConstraints( time_delta, n1, n2 );
    	};
    })();

    Goblin.SliderConstraint.prototype._updateLinearConstraints = function( time_delta, n1, n2 ) {
    	var c = new Goblin.Vector3();
    	c.subtractVectors( this.object_b.position, this.object_a.position );
    	//c.scale( 0.5 );

    	var cx = new Goblin.Vector3( );

    	// first linear constraint
    	cx.crossVectors( c, n1 );
    	this.rows[0].jacobian[0] = -n1.x;
    	this.rows[0].jacobian[1] = -n1.y;
    	this.rows[0].jacobian[2] = -n1.z;
    	//this.rows[0].jacobian[3] = -cx[0];
    	//this.rows[0].jacobian[4] = -cx[1];
    	//this.rows[0].jacobian[5] = -cx[2];

    	this.rows[0].jacobian[6] = n1.x;
    	this.rows[0].jacobian[7] = n1.y;
    	this.rows[0].jacobian[8] = n1.z;
    	this.rows[0].jacobian[9] = 0;
    	this.rows[0].jacobian[10] = 0;
    	this.rows[0].jacobian[11] = 0;

    	// second linear constraint
    	cx.crossVectors( c, n2 );
    	this.rows[1].jacobian[0] = -n2.x;
    	this.rows[1].jacobian[1] = -n2.y;
    	this.rows[1].jacobian[2] = -n2.z;
    	//this.rows[1].jacobian[3] = -cx[0];
    	//this.rows[1].jacobian[4] = -cx[1];
    	//this.rows[1].jacobian[5] = -cx[2];

    	this.rows[1].jacobian[6] = n2.x;
    	this.rows[1].jacobian[7] = n2.y;
    	this.rows[1].jacobian[8] = n2.z;
    	this.rows[1].jacobian[9] = 0;
    	this.rows[1].jacobian[10] = 0;
    	this.rows[1].jacobian[11] = 0;

    	// linear constraint error
    	//c.scale( 2  );
    	this.object_a.rotation.transformVector3Into( this.position_error, _tmp_vec3_1 );
    	_tmp_vec3_2.subtractVectors( c, _tmp_vec3_1 );
    	_tmp_vec3_2.scale( this.erp / time_delta  );
    	this.rows[0].bias = -n1.dot( _tmp_vec3_2 );
    	this.rows[1].bias = -n2.dot( _tmp_vec3_2 );
    };

    Goblin.SliderConstraint.prototype._updateAngularConstraints = function( time_delta, n1, n2, axis ) {
    	this.rows[2].jacobian[3] = this.rows[3].jacobian[4] = this.rows[4].jacobian[5] = -1;
    	this.rows[2].jacobian[9] = this.rows[3].jacobian[10] = this.rows[4].jacobian[11] = 1;

    	_tmp_quat4_1.invertQuaternion( this.object_b.rotation );
    	_tmp_quat4_1.multiply( this.object_a.rotation );

    	_tmp_quat4_2.invertQuaternion( this.rotation_difference );
    	_tmp_quat4_2.multiply( _tmp_quat4_1 );
    	// _tmp_quat4_2 is now the rotational error that needs to be corrected

    	var error = new Goblin.Vector3();
    	error.x = _tmp_quat4_2.x;
    	error.y = _tmp_quat4_2.y;
    	error.z = _tmp_quat4_2.z;
    	error.scale( this.erp / time_delta  );

    	//this.rows[2].bias = error[0];
    	//this.rows[3].bias = error[1];
    	//this.rows[4].bias = error[2];
    };
    Goblin.WeldConstraint = function( object_a, point_a, object_b, point_b ) {
    	Goblin.Constraint.call( this );

    	this.object_a = object_a;
    	this.point_a = point_a;

    	this.object_b = object_b || null;
    	this.point_b = point_b || null;

    	this.rotation_difference = new Goblin.Quaternion();
    	if ( this.object_b != null ) {
    		_tmp_quat4_1.invertQuaternion( this.object_b.rotation );
    		this.rotation_difference.multiplyQuaternions( _tmp_quat4_1, this.object_a.rotation );
    	}

    	this.erp = 0.1;

    	// Create translation constraint rows
    	for ( var i = 0; i < 3; i++ ) {
    		this.rows[i] = Goblin.ObjectPool.getObject( 'ConstraintRow' );
    		this.rows[i].lower_limit = -Infinity;
    		this.rows[i].upper_limit = Infinity;
    		this.rows[i].bias = 0;

    		if ( this.object_b == null ) {
    			this.rows[i].jacobian[0] = this.rows[i].jacobian[1] = this.rows[i].jacobian[2] =
    				this.rows[i].jacobian[4] = this.rows[i].jacobian[5] = this.rows[i].jacobian[6] =
    				this.rows[i].jacobian[7] = this.rows[i].jacobian[8] = this.rows[i].jacobian[9] =
    				this.rows[i].jacobian[10] = this.rows[i].jacobian[11] = this.rows[i].jacobian[12] = 0;
    			this.rows[i].jacobian[i] = 1;
    		}
    	}

    	// Create rotation constraint rows
    	for ( i = 3; i < 6; i++ ) {
    		this.rows[i] = Goblin.ObjectPool.getObject( 'ConstraintRow' );
    		this.rows[i].lower_limit = -Infinity;
    		this.rows[i].upper_limit = Infinity;
    		this.rows[i].bias = 0;

    		if ( this.object_b == null ) {
    			this.rows[i].jacobian[0] = this.rows[i].jacobian[1] = this.rows[i].jacobian[2] =
    				this.rows[i].jacobian[4] = this.rows[i].jacobian[5] = this.rows[i].jacobian[6] =
    				this.rows[i].jacobian[7] = this.rows[i].jacobian[8] = this.rows[i].jacobian[9] =
    				this.rows[i].jacobian[10] = this.rows[i].jacobian[11] = this.rows[i].jacobian[12] = 0;
    			this.rows[i].jacobian[i] = 1;
    		} else {
    			this.rows[i].jacobian[0] = this.rows[i].jacobian[1] = this.rows[i].jacobian[2] = 0;
    			this.rows[i].jacobian[3] = this.rows[i].jacobian[4] = this.rows[i].jacobian[5] = 0;
    			this.rows[i].jacobian[ i ] = -1;

    			this.rows[i].jacobian[6] = this.rows[i].jacobian[7] = this.rows[i].jacobian[8] = 0;
    			this.rows[i].jacobian[9] = this.rows[i].jacobian[10] = this.rows[i].jacobian[11] = 0;
    			this.rows[i].jacobian[ i + 6 ] = 1;
    		}
    	}
    };
    Goblin.WeldConstraint.prototype = Object.create( Goblin.Constraint.prototype );

    Goblin.WeldConstraint.prototype.update = (function(){
    	var r1 = new Goblin.Vector3(),
    		r2 = new Goblin.Vector3();

    	return function( time_delta ) {
    		if ( this.object_b == null ) {
    			// No need to update the constraint, all motion is already constrained
    			return;
    		}

    		this.object_a.transform.transformVector3Into( this.point_a, _tmp_vec3_1 );
    		r1.subtractVectors( _tmp_vec3_1, this.object_a.position );

    		this.rows[0].jacobian[0] = -1;
    		this.rows[0].jacobian[1] = 0;
    		this.rows[0].jacobian[2] = 0;
    		this.rows[0].jacobian[3] = 0;
    		this.rows[0].jacobian[4] = -r1.z;
    		this.rows[0].jacobian[5] = r1.y;

    		this.rows[1].jacobian[0] = 0;
    		this.rows[1].jacobian[1] = -1;
    		this.rows[1].jacobian[2] = 0;
    		this.rows[1].jacobian[3] = r1.z;
    		this.rows[1].jacobian[4] = 0;
    		this.rows[1].jacobian[5] = -r1.x;

    		this.rows[2].jacobian[0] = 0;
    		this.rows[2].jacobian[1] = 0;
    		this.rows[2].jacobian[2] = -1;
    		this.rows[2].jacobian[3] = -r1.y;
    		this.rows[2].jacobian[4] = r1.x;
    		this.rows[2].jacobian[5] = 0;

    		if ( this.object_b != null ) {
    			this.object_b.transform.transformVector3Into( this.point_b, _tmp_vec3_2 );
    			r2.subtractVectors( _tmp_vec3_2, this.object_b.position );

    			this.rows[0].jacobian[6] = 1;
    			this.rows[0].jacobian[7] = 0;
    			this.rows[0].jacobian[8] = 0;
    			this.rows[0].jacobian[9] = 0;
    			this.rows[0].jacobian[10] = r2.z;
    			this.rows[0].jacobian[11] = -r2.y;

    			this.rows[1].jacobian[6] = 0;
    			this.rows[1].jacobian[7] = 1;
    			this.rows[1].jacobian[8] = 0;
    			this.rows[1].jacobian[9] = -r2.z;
    			this.rows[1].jacobian[10] = 0;
    			this.rows[1].jacobian[11] = r2.x;

    			this.rows[2].jacobian[6] = 0;
    			this.rows[2].jacobian[7] = 0;
    			this.rows[2].jacobian[8] = 1;
    			this.rows[2].jacobian[9] = r2.y;
    			this.rows[2].jacobian[10] = -r2.x;
    			this.rows[2].jacobian[11] = 0;
    		} else {
    			_tmp_vec3_2.copy( this.point_b );
    		}

    		var error = new Goblin.Vector3();

    		// Linear correction
    		error.subtractVectors( _tmp_vec3_1, _tmp_vec3_2 );
    		error.scale( this.erp / time_delta  );
    		this.rows[0].bias = error.x;
    		this.rows[1].bias = error.y;
    		this.rows[2].bias = error.z;

    		// Rotation correction
    		_tmp_quat4_1.invertQuaternion( this.object_b.rotation );
    		_tmp_quat4_1.multiply( this.object_a.rotation );

    		_tmp_quat4_2.invertQuaternion( this.rotation_difference );
    		_tmp_quat4_2.multiply( _tmp_quat4_1 );
    		// _tmp_quat4_2 is now the rotational error that needs to be corrected

    		error.x = _tmp_quat4_2.x;
    		error.y = _tmp_quat4_2.y;
    		error.z = _tmp_quat4_2.z;
    		error.scale( this.erp / time_delta );

    		this.rows[3].bias = error.x;
    		this.rows[4].bias = error.y;
    		this.rows[5].bias = error.z;
    	};
    })( );
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

    		force.copy( object.linear_velocity );

    		// Calculate the total drag coefficient.
    		drag = force.length();
    		drag = ( this.drag_coefficient * drag ) + ( this.squared_drag_coefficient * drag * drag );

    		// Calculate the final force and apply it.
    		force.normalize();
    		force.scale( -drag );
    		object.applyForce( force  );
    	}
    };
    Goblin.RayIntersection = function() {
    	this.object = null;
    	this.point = new Goblin.Vector3();
    	this.t = null;
        this.normal = new Goblin.Vector3();
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
    	 * @property half_width
    	 * @type {Number}
    	 */
    	this.half_width = half_width;

    	/**
    	 * Half height of the cube ( Y axis )
    	 *
    	 * @property half_height
    	 * @type {Number}
    	 */
    	this.half_height = half_height;

    	/**
    	 * Half width of the cube ( Z axis )
    	 *
    	 * @property half_height
    	 * @type {Number}
    	 */
    	this.half_depth = half_depth;

        this.aabb = new Goblin.AABB();
        this.calculateLocalAABB( this.aabb );
    };

    /**
     * Calculates this shape's local AABB and stores it in the passed AABB object
     *
     * @method calculateLocalAABB
     * @param aabb {AABB}
     */
    Goblin.BoxShape.prototype.calculateLocalAABB = function( aabb ) {
        aabb.min.x = -this.half_width;
        aabb.min.y = -this.half_height;
        aabb.min.z = -this.half_depth;

        aabb.max.x = this.half_width;
        aabb.max.y = this.half_height;
        aabb.max.z = this.half_depth;
    };

    Goblin.BoxShape.prototype.getInertiaTensor = function( mass ) {
    	var height_squared = this.half_height * this.half_height * 4,
    		width_squared = this.half_width * this.half_width * 4,
    		depth_squared = this.half_depth * this.half_depth * 4,
    		element = 0.0833 * mass;
    	return new Goblin.Matrix3(
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
    Goblin.BoxShape.prototype.findSupportPoint = function( direction, support_point ) {
    	/*
    	support_point = [
    		sign( direction.x ) * half_width,
    		sign( direction.y ) * half_height,
    		sign( direction.z ) * half_depth
    	]
    	*/

    	// Calculate the support point in the local frame
    	if ( direction.x < 0 ) {
    		support_point.x = -this.half_width;
    	} else {
    		support_point.x = this.half_width;
    	}

    	if ( direction.y < 0 ) {
    		support_point.y = -this.half_height;
    	} else {
    		support_point.y = this.half_height;
    	}

    	if ( direction.z < 0 ) {
    		support_point.z = -this.half_depth;
    	} else {
    		support_point.z = this.half_depth;
    	}
    };

    /**
     * Checks if a ray segment intersects with the shape
     *
     * @method rayIntersect
     * @property start {vec3} start point of the segment
     * @property end {vec3} end point of the segment
     * @return {RayIntersection|null} if the segment intersects, a RayIntersection is returned, else `null`
     */
    Goblin.BoxShape.prototype.rayIntersect = (function(){
    	var direction = new Goblin.Vector3(),
    		tmin, tmax,
    		axis, ood, t1, t2, extent;

    	return function( start, end ) {
    		tmin = 0;

    		direction.subtractVectors( end, start );
    		tmax = direction.length();
    		direction.scale( 1 / tmax ); // normalize direction

    		for ( var i = 0; i < 3; i++ ) {
    			axis = i === 0 ? 'x' : ( i === 1 ? 'y' : 'z' );
    			extent = ( i === 0 ? this.half_width : (  i === 1 ? this.half_height : this.half_depth ) );

    			if ( Math.abs( direction[axis] ) < Goblin.EPSILON ) {
    				// Ray is parallel to axis
    				if ( start[axis] < -extent || start[axis] > extent ) {
    					return null;
    				}
    			}

                ood = 1 / direction[axis];
                t1 = ( -extent - start[axis] ) * ood;
                t2 = ( extent - start[axis] ) * ood;
                if ( t1 > t2  ) {
                    ood = t1; // ood is a convenient temp variable as it's not used again
                    t1 = t2;
                    t2 = ood;
                }

                // Find intersection intervals
                tmin = Math.max( tmin, t1 );
                tmax = Math.min( tmax, t2 );

                if ( tmin > tmax ) {
                    return null;
                }
    		}

    		var intersection = Goblin.ObjectPool.getObject( 'RayIntersection' );
    		intersection.object = this;
    		intersection.t = tmin;
    		intersection.point.scaleVector( direction, tmin );
    		intersection.point.add( start );

    		// Find face normal
            var max = Infinity;
    		for ( i = 0; i < 3; i++ ) {
    			axis = i === 0 ? 'x' : ( i === 1 ? 'y' : 'z' );
    			extent = ( i === 0 ? this.half_width : (  i === 1 ? this.half_height : this.half_depth ) );
    			if ( extent - Math.abs( intersection.point[axis] ) < max ) {
    				intersection.normal.x = intersection.normal.y = intersection.normal.z = 0;
    				intersection.normal[axis] = intersection.point[axis] < 0 ? -1 : 1;
    				max = extent - Math.abs( intersection.point[axis] );
    			}
    		}

    		return intersection;
    	};
    })();
    /**
     * @class CompoundShape
     * @constructor
     */
    Goblin.CompoundShape = function() {
    	this.child_shapes = [];

    	this.aabb = new Goblin.AABB();
    	this.calculateLocalAABB( this.aabb );
    };

    /**
     * Adds the child shape at `position` and `rotation` relative to the compound shape
     *
     * @method addChildShape
     * @param shape
     * @param position
     * @param rotation
     */
    Goblin.CompoundShape.prototype.addChildShape = function( shape, position, rotation ) {
    	this.child_shapes.push( new Goblin.CompoundShapeChild( shape, position, rotation ) );
    	this.calculateLocalAABB( this.aabb );
    };

    /**
     * Calculates this shape's local AABB and stores it in the passed AABB object
     *
     * @method calculateLocalAABB
     * @param aabb {AABB}
     */
    Goblin.CompoundShape.prototype.calculateLocalAABB = function( aabb ) {
    	aabb.min.x = aabb.min.y = aabb.min.z = Infinity;
    	aabb.max.x = aabb.max.y = aabb.max.z = -Infinity;

    	var i, shape;

    	for ( i = 0; i < this.child_shapes.length; i++ ) {
    		shape = this.child_shapes[i];

    		aabb.min.x = Math.min( aabb.min.x, shape.aabb.min.x );
    		aabb.min.y = Math.min( aabb.min.y, shape.aabb.min.y );
    		aabb.min.z = Math.min( aabb.min.z, shape.aabb.min.z );

    		aabb.max.x = Math.max( aabb.max.x, shape.aabb.max.x );
    		aabb.max.y = Math.max( aabb.max.y, shape.aabb.max.y );
    		aabb.max.z = Math.max( aabb.max.z, shape.aabb.max.z );
    	}
    };

    Goblin.CompoundShape.prototype.getInertiaTensor = function( mass ) {
    	var tensor = new Goblin.Matrix3(),
    		j = new Goblin.Matrix3(),
    		i,
    		child,
    		child_tensor;

    	mass /= this.child_shapes.length;

    	// Holds center of current tensor
    	_tmp_vec3_1.x = _tmp_vec3_1.y = _tmp_vec3_1.z = 0;

    	for ( i = 0; i < this.child_shapes.length; i++ ) {
    		child = this.child_shapes[i];

    		_tmp_vec3_1.subtract( child.position );

    		j.e00 = mass * -( _tmp_vec3_1.y * _tmp_vec3_1.y + _tmp_vec3_1.z * _tmp_vec3_1.z );
    		j.e10 = mass * _tmp_vec3_1.x * _tmp_vec3_1.y;
    		j.e20 = mass * _tmp_vec3_1.x * _tmp_vec3_1.z;

    		j.e01 = mass * _tmp_vec3_1.x * _tmp_vec3_1.y;
    		j.e11 = mass * -( _tmp_vec3_1.x * _tmp_vec3_1.x + _tmp_vec3_1.z * _tmp_vec3_1.z );
    		j.e21 = mass * _tmp_vec3_1.y * _tmp_vec3_1.z;

    		j.e02 = mass * _tmp_vec3_1.x * _tmp_vec3_1.z;
    		j.e12 = mass * _tmp_vec3_1.y * _tmp_vec3_1.z;
    		j.e22 = mass * -( _tmp_vec3_1.x * _tmp_vec3_1.x + _tmp_vec3_1.y * _tmp_vec3_1.y );

    		_tmp_mat3_1.fromMatrix4( child.transform );
    		child_tensor = child.shape.getInertiaTensor( mass );
    		_tmp_mat3_1.transposeInto( _tmp_mat3_2 );
    		_tmp_mat3_1.multiply( child_tensor );
    		_tmp_mat3_1.multiply( _tmp_mat3_2 );

    		tensor.e00 += _tmp_mat3_1.e00 + j.e00;
    		tensor.e10 += _tmp_mat3_1.e10 + j.e10;
    		tensor.e20 += _tmp_mat3_1.e20 + j.e20;
    		tensor.e01 += _tmp_mat3_1.e01 + j.e01;
    		tensor.e11 += _tmp_mat3_1.e11 + j.e11;
    		tensor.e21 += _tmp_mat3_1.e21 + j.e21;
    		tensor.e02 += _tmp_mat3_1.e02 + j.e02;
    		tensor.e12 += _tmp_mat3_1.e12 + j.e12;
    		tensor.e22 += _tmp_mat3_1.e22 + j.e22;
    	}

    	return tensor;
    };

    /**
     * Checks if a ray segment intersects with the shape
     *
     * @method rayIntersect
     * @property ray_start {vec3} start point of the segment
     * @property ray_end {vec3} end point of the segment
     * @return {RayIntersection|null} if the segment intersects, a RayIntersection is returned, else `null`
     */
    Goblin.CompoundShape.prototype.rayIntersect = (function(){
    	var tSort = function( a, b ) {
    		if ( a.t < b.t ) {
    			return -1;
    		} else if ( a.t > b.t ) {
    			return 1;
    		} else {
    			return 0;
    		}
    	};
    	return function( ray_start, ray_end ) {
    		var intersections = [],
    			local_start = new Goblin.Vector3(),
    			local_end = new Goblin.Vector3(),
    			intersection,
    			i, child;

    		for ( i = 0; i < this.child_shapes.length; i++ ) {
    			child = this.child_shapes[i];

    			child.transform_inverse.transformVector3Into( ray_start, local_start );
    			child.transform_inverse.transformVector3Into( ray_end, local_end );

    			intersection = child.shape.rayIntersect( local_start, local_end );
    			if ( intersection != null ) {
    				intersection.object = this; // change from the shape to the body
    				child.transform.transformVector3( intersection.point ); // transform child's local coordinates to the compound's coordinates
    				intersections.push( intersection );
    			}
    		}

    		intersections.sort( tSort );
    		return intersections[0] || null;
    	};
    })();
    /**
     * @class CompoundShapeChild
     * @constructor
     */
    Goblin.CompoundShapeChild = function( shape, position, rotation ) {
    	this.shape = shape;

    	this.position = new Goblin.Vector3( position.x, position.y, position.z );
    	this.rotation = new Goblin.Quaternion( rotation.x, rotation.y, rotation.z, rotation.w );

    	this.transform = new Goblin.Matrix4();
    	this.transform_inverse = new Goblin.Matrix4();
    	this.transform.makeTransform( this.rotation, this.position );
    	this.transform.invertInto( this.transform_inverse );

    	this.aabb = new Goblin.AABB();
    	this.aabb.transform( this.shape.aabb, this.transform );
    };
    /**
     * @class ConeShape
     * @param radius {Number} radius of the cylinder
     * @param half_height {Number} half height of the cylinder
     * @constructor
     */
    Goblin.ConeShape = function( radius, half_height ) {
    	/**
    	 * radius of the cylinder
    	 *
    	 * @property radius
    	 * @type {Number}
    	 */
    	this.radius = radius;

    	/**
    	 * half height of the cylinder
    	 *
    	 * @property half_height
    	 * @type {Number}
    	 */
    	this.half_height = half_height;

        this.aabb = new Goblin.AABB();
        this.calculateLocalAABB( this.aabb );

        /**
         * sin of the cone's angle
         *
         * @property _sinagle
         * @type {Number}
         * @private
         */
    	this._sinangle = this.radius / Math.sqrt( this.radius * this.radius + Math.pow( 2 * this.half_height, 2 ) );

        /**
         * cos of the cone's angle
         *
         * @property _cosangle
         * @type {Number}
         * @private
         */
        this._cosangle = Math.cos( Math.asin( this._sinangle ) );
    };

    /**
     * Calculates this shape's local AABB and stores it in the passed AABB object
     *
     * @method calculateLocalAABB
     * @param aabb {AABB}
     */
    Goblin.ConeShape.prototype.calculateLocalAABB = function( aabb ) {
        aabb.min.x = aabb.min.z = -this.radius;
        aabb.min.y = -this.half_height;

        aabb.max.x = aabb.max.z = this.radius;
        aabb.max.y = this.half_height;
    };

    Goblin.ConeShape.prototype.getInertiaTensor = function( mass ) {
    	var element = 0.1 * mass * Math.pow( this.half_height * 2, 2 ) + 0.15 * mass * this.radius * this.radius;

    	return new Goblin.Matrix3(
    		element, 0, 0,
    		0, 0.3 * mass * this.radius * this.radius, 0,
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
    Goblin.ConeShape.prototype.findSupportPoint = function( direction, support_point ) {
    	// Calculate the support point in the local frame
    	//var w = direction - ( direction.y )
    	var sigma = Math.sqrt( direction.x * direction.x + direction.z * direction.z );

    	if ( direction.y > direction.length() * this._sinangle ) {
    		support_point.x = support_point.z = 0;
    		support_point.y = this.half_height;
    	} else if ( sigma > 0 ) {
    		var r_s = this.radius / sigma;
    		support_point.x = r_s * direction.x;
    		support_point.y = -this.half_height;
    		support_point.z = r_s * direction.z;
    	} else {
    		support_point.x = support_point.z = 0;
    		support_point.y = -this.half_height;
    	}
    };

    /**
     * Checks if a ray segment intersects with the shape
     *
     * @method rayIntersect
     * @property start {vec3} start point of the segment
     * @property end {vec3{ end point of the segment
     * @return {RayIntersection|null} if the segment intersects, a RayIntersection is returned, else `null`
     */
    Goblin.ConeShape.prototype.rayIntersect = (function(){
        var direction = new Goblin.Vector3(),
            length,
            p1 = new Goblin.Vector3(),
            p2 = new Goblin.Vector3(),
    		normal1 = new Goblin.Vector3(),
    		normal2 = new Goblin.Vector3();

        return function( start, end ) {
            direction.subtractVectors( end, start );
            length = direction.length();
            direction.scale( 1 / length  ); // normalize direction

            var t1, t2;

            // Check for intersection with cone base
    		p1.x = p1.y = p1.z = 0;
            t1 = this._rayIntersectBase( start, end, p1, normal1 );

            // Check for intersection with cone shape
    		p2.x = p2.y = p2.z = 0;
            t2 = this._rayIntersectCone( start, direction, length, p2, normal2 );

            var intersection;

            if ( !t1 && !t2 ) {
                return null;
            } else if ( !t2 || ( t1 &&  t1 < t2 ) ) {
                intersection = Goblin.ObjectPool.getObject( 'RayIntersection' );
                intersection.object = this;
    			intersection.t = t1;
                intersection.point.copy( p1 );
    			intersection.normal.copy( normal1 );
                return intersection;
            } else if ( !t1 || ( t2 && t2 < t1 ) ) {
                intersection = Goblin.ObjectPool.getObject( 'RayIntersection' );
                intersection.object = this;
    			intersection.t = t2;
                intersection.point.copy( p2 );
    			intersection.normal.copy( normal2 );
                return intersection;
            }

            return null;
        };
    })();

    Goblin.ConeShape.prototype._rayIntersectBase = (function(){
        var _normal = new Goblin.Vector3( 0, -1, 0 ),
            ab = new Goblin.Vector3(),
            _start = new Goblin.Vector3(),
            _end = new Goblin.Vector3(),
            t;

        return function( start, end, point, normal ) {
            _start.x = start.x;
            _start.y = start.y + this.half_height;
            _start.z = start.z;

            _end.x = end.x;
            _end.y = end.y + this.half_height;
            _end.z = end.z;

            ab.subtractVectors( _end, _start );
            t = -_normal.dot( _start ) / _normal.dot( ab );

            if ( t < 0 || t > 1 ) {
                return null;
            }

            point.scaleVector( ab, t );
            point.add( start );

            if ( point.x * point.x + point.z * point.z > this.radius * this.radius ) {
                return null;
            }

    		normal.x = normal.z = 0;
    		normal.y = -1;

            return t * ab.length();
        };
    })();

    /**
     * Checks if a ray segment intersects with the cone definition
     *
     * @method _rayIntersectCone
     * @property start {vec3} start point of the segment
     * @property direction {vec3} normalized direction vector of the segment, from `start`
     * @property length {Number} segment length
     * @property point {vec3} (out) location of intersection
     * @private
     * @return {vec3|null} if the segment intersects, point where the segment intersects the cone, else `null`
     */
    Goblin.ConeShape.prototype._rayIntersectCone = (function(){
        var _point = new Goblin.Vector3();

        return function( start, direction, length, point, normal ) {
            var A = new Goblin.Vector3( 0, -1, 0 );

            var AdD = A.dot( direction ),
                cosSqr = this._cosangle * this._cosangle;

            var E = new Goblin.Vector3();
            E.x = start.x;
            E.y = start.y - this.half_height;
            E.z = start.z;

            var AdE = A.dot( E ),
                DdE = direction.dot( E ),
                EdE = E.dot( E ),
                c2 = AdD * AdD - cosSqr,
                c1 = AdD * AdE - cosSqr * DdE,
                c0 = AdE * AdE - cosSqr * EdE,
                dot, t, tmin = null;

            if ( Math.abs( c2 ) >= Goblin.EPSILON ) {
                var discr = c1 * c1 - c0 * c2;
    			if ( discr < -Goblin.EPSILON ) {
                    return null;
                } else if ( discr > Goblin.EPSILON ) {
                    var root = Math.sqrt( discr ),
                        invC2 = 1 / c2;

                    t = ( -c1 - root ) * invC2;
                    if ( t >= 0 && t <= length ) {
                        _point.scaleVector( direction, t );
                        _point.add( start );
                        E.y = _point.y - this.half_height;
                        dot = E.dot( A );
                        if ( dot >= 0 ) {
                            tmin = t;
                            point.copy( _point );
                        }
                    }

                    t = ( -c1 + root ) * invC2;
                    if ( t >= 0 && t <= length ) {
                        if ( tmin == null || t < tmin ) {
                            _point.scaleVector( direction, t );
                            _point.add( start );
                            E.y = _point.y - this.half_height;
                            dot = E.dot( A );
                            if ( dot >= 0 ) {
                                tmin = t;
                                point.copy( _point );
                            }
                        }
                    }

                    if ( tmin == null ) {
                        return null;
                    }
                    tmin /= length;
                } else {
                    t = -c1 / c2;
                    _point.scaleVector( direction, t );
                    _point.add( start );
                    E.y = _point.y - this.half_height;
                    dot = E.dot( A );
                    if ( dot < 0 ) {
                        return null;
                    }

                    // Verify segment reaches _point
                    _tmp_vec3_1.subtractVectors( _point, start );
                    if ( _tmp_vec3_1.lengthSquared() > length * length ) {
                        return null;
                    }

                    tmin = t / length;
                    point.copy( _point );
                }
            } else if ( Math.abs( c1 ) >= Goblin.EPSILON ) {
                t = 0.5 * c0 / c1;
                _point.scaleVector( direction, t );
                _point.add( start );
                E.y = _point.y - this.half_height;
                dot = E.dot( A );
                if ( dot < 0 ) {
                    return null;
                }
                tmin = t;
                point.copy( _point );
            } else {
                return null;
            }

            if ( point.y < -this.half_height ) {
                return null;
            }

    		// Compute normal
    		normal.x = point.x;
    		normal.y = 0;
    		normal.z = point.z;
    		normal.normalize();

    		normal.x *= ( this.half_height * 2 ) / this.radius;
    		normal.y = this.radius / ( this.half_height * 2 );
    		normal.z *= ( this.half_height * 2 ) / this.radius;
    		normal.normalize();

            return tmin * length;
        };
    })();
    /**
     * @class ConvexShape
     * @param vertices {Array<vec3>} array of vertices composing the convex hull
     * @constructor
     */
    Goblin.ConvexShape = function( vertices ) {
    	/**
    	 * vertices composing the convex hull
    	 *
    	 * @property vertices
    	 * @type {Array<vec3>}
    	 */
    	this.vertices = [];

    	/**
    	 * faces composing the convex hull
    	 * @type {Array}
    	 */
    	this.faces = [];

    	/**
    	 * the convex hull's volume
    	 * @property volume
    	 * @type {number}
    	 */
    	this.volume = 0;

    	/**
    	 * coordinates of the hull's COM
    	 * @property center_of_mass
    	 * @type {vec3}
    	 */
    	this.center_of_mass = new Goblin.Vector3();

    	/**
    	 * used in computing the convex hull's center of mass & volume
    	 * @property _intergral
    	 * @type {Float32Array}
    	 * @private
    	 */
    	this._integral = new Float32Array( 10 );

    	this.process( vertices );

    	this.aabb = new Goblin.AABB();
    	this.calculateLocalAABB( this.aabb );
    };

    Goblin.ConvexShape.prototype.process = function( vertices ) {
    	// Find two points furthest apart on X axis
    	var candidates = vertices.slice(),
    		min_point = null,
    		max_point = null;

    	for ( var i = 0; i < candidates.length; i++ ) {
    		var vertex = candidates[i];

    		if ( min_point == null || min_point.x > vertex.x ) {
    			min_point = vertex;
    		}
    		if ( max_point == null || max_point.x > vertex.x ) {
    			max_point = vertex;
    		}
    	}
    	if ( min_point === max_point ) {
    		max_point = vertices[0] === min_point ? vertices[1] : vertices[0];
    	}

    	// Initial 1-simplex
    	var point_a = min_point,
    		point_b = max_point;
    	candidates.splice( candidates.indexOf( point_a ), 1 );
    	candidates.splice( candidates.indexOf( point_b ), 1 );

    	// Find the point most distant from the line to construct the 2-simplex
    	var distance = -Infinity,
    		furthest_idx = null,
    		candidate, candidate_distance;

    	for ( i = 0; i < candidates.length; i++ ) {
    		candidate = candidates[i];
    		candidate_distance = Goblin.GeometryMethods.findSquaredDistanceFromSegment( candidate, point_a, point_b );
    		if ( candidate_distance > distance ) {
    			distance = candidate_distance;
    			furthest_idx = i;
    		}
    	}
    	var point_c = candidates[furthest_idx];
    	candidates.splice( furthest_idx, 1 );

    	// Fourth point of the 3-simplex is the one furthest away from the 2-simplex
    	_tmp_vec3_1.subtractVectors( point_b, point_a );
    	_tmp_vec3_2.subtractVectors( point_c, point_a );
    	_tmp_vec3_1.cross( _tmp_vec3_2 ); // _tmp_vec3_1 is the normal of the 2-simplex

    	distance = -Infinity;
    	furthest_idx = null;

    	for ( i = 0; i < candidates.length; i++ ) {
    		candidate = candidates[i];
    		candidate_distance = Math.abs( _tmp_vec3_1.dot( candidate ) );
    		if ( candidate_distance > distance ) {
    			distance = candidate_distance;
    			furthest_idx = i;
    		}
    	}
    	var point_d = candidates[furthest_idx];
    	candidates.splice( furthest_idx, 1 );

    	// If `point_d` is on the front side of `abc` then flip to `cba`
    	if ( _tmp_vec3_1.dot( point_d ) > 0 ) {
    		var tmp_point = point_a;
    		point_a = point_c;
    		point_c = tmp_point;
    	}

    	// We have our starting tetrahedron, rejoice
    	// Now turn that into a polyhedron
    	var polyhedron = new Goblin.GjkEpa.Polyhedron({ points:[
    		{ point: point_c }, { point: point_b }, { point: point_a }, { point: point_d }
    	]});

    	// Add the rest of the points
    	for ( i = 0; i < candidates.length; i++ ) {
    		// We are going to lie and tell the polyhedron that its closest face is any of the faces which can see the candidate
    		polyhedron.closest_face = null;
    		for ( var j = 0; j < polyhedron.faces.length; j++ ) {
    			if ( polyhedron.faces[j].active === true && polyhedron.faces[j].classifyVertex( { point: candidates[i] } ) > 0 ) {
    				polyhedron.closest_face = j;
    				break;
    			}
    		}
    		if ( polyhedron.closest_face == null ) {
    			// This vertex is already contained by the existing hull, ignore
    			continue;
    		}
    		polyhedron.addVertex( { point: candidates[i] } );
    	}

    	this.faces = polyhedron.faces.filter(function( face ){
    		return face.active;
    	});

    	// find all the vertices & edges which make up the convex hull
    	var convexshape = this;
    	
    	this.faces.forEach(function( face ){
    		// If we haven't already seen these vertices then include them
    		var a = face.a.point,
    			b = face.b.point,
    			c = face.c.point,
    			ai = convexshape.vertices.indexOf( a ),
    			bi = convexshape.vertices.indexOf( b ),
    			ci = convexshape.vertices.indexOf( c );

    		// Include vertices if they are new
    		if ( ai === -1 ) {
    			convexshape.vertices.push( a );
    		}
    		if ( bi === -1 ) {
    			convexshape.vertices.push( b );
    		}
    		if ( ci === -1 ) {
    			convexshape.vertices.push( c );
    		}
    	});

    	this.computeVolume( this.faces );
    };

    /**
     * Calculates this shape's local AABB and stores it in the passed AABB object
     *
     * @method calculateLocalAABB
     * @param aabb {AABB}
     */
    Goblin.ConvexShape.prototype.calculateLocalAABB = function( aabb ) {
    	aabb.min.x = aabb.min.y = aabb.min.z = 0;
    	aabb.max.x = aabb.max.y = aabb.max.z = 0;

    	for ( var i = 0; i < this.vertices.length; i++ ) {
    		aabb.min.x = Math.min( aabb.min.x, this.vertices[i].x );
    		aabb.min.y = Math.min( aabb.min.y, this.vertices[i].y );
    		aabb.min.z = Math.min( aabb.min.z, this.vertices[i].z );

    		aabb.max.x = Math.max( aabb.max.x, this.vertices[i].x );
    		aabb.max.y = Math.max( aabb.max.y, this.vertices[i].y );
    		aabb.max.z = Math.max( aabb.max.z, this.vertices[i].z );
    	}
    };

    Goblin.ConvexShape.prototype.computeVolume = (function(){
    	var origin = { point: new Goblin.Vector3() },
    		output = new Float32Array( 6 ),
    		macro = function( a, b, c ) {
    			var temp0 = a + b,
    				temp1 = a * a,
    				temp2 = temp1 + b * temp0;

    			output[0] = temp0 + c;
    			output[1] = temp2 + c * output[0];
    			output[2] = a * temp1 + b * temp2 + c * output[1];
    			output[3] = output[1] + a * ( output[0] + a );
    			output[4] = output[1] + b * ( output[0] + b );
    			output[5] = output[1] + c * ( output[0] + c );
    		};

    	return function( faces ) {
    		for ( var i = 0; i < faces.length; i++ ) {
    			var face = faces[i],
    				v0 = face.a.point,
    				v1 = face.b.point,
    				v2 = face.c.point;

    			var a1 = v1.x - v0.x,
    				b1 = v1.y - v0.y,
    				c1 = v1.z - v0.z,
    				a2 = v2.x - v0.x,
    				b2 = v2.y - v0.y,
    				c2 = v2.z - v0.z,
    				d0 = b1 * c2 - b2 * c1,
    				d1 = a2 * c1 - a1 * c2,
    				d2 = a1 * b2 - a2 * b1;

    			macro( v0.x, v1.x, v2.x );
    			var f1x = output[0],
    				f2x = output[1],
    				f3x = output[2],
    				g0x = output[3],
    				g1x = output[4],
    				g2x = output[5];

    			macro( v0.y, v1.y, v2.y );
    			var f1y = output[0],
    				f2y = output[1],
    				f3y = output[2],
    				g0y = output[3],
    				g1y = output[4],
    				g2y = output[5];

    			macro( v0.z, v1.z, v2.z );
    			var f1z = output[0],
    				f2z = output[1],
    				f3z = output[2],
    				g0z = output[3],
    				g1z = output[4],
    				g2z = output[5];

    			var contributor = face.classifyVertex( origin ) > 0 ? -1 : 1;

    			this._integral[0] += contributor * d0 * f1x;
    			this._integral[1] += contributor * d0 * f2x;
    			this._integral[2] += contributor * d1 * f2y;
    			this._integral[3] += contributor * d2 * f2z;
    			this._integral[4] += contributor * d0 * f3x;
    			this._integral[5] += contributor * d1 * f3y;
    			this._integral[6] += contributor * d2 * f3z;
    			this._integral[7] += contributor * d0 * ( v0.y * g0x + v1.y * g1x + v2.y * g2x );
    			this._integral[8] += contributor * d1 * ( v0.z * g0y + v1.z * g1y + v2.z * g2y );
    			this._integral[9] += contributor * d2 * ( v0.x * g0z + v1.x * g1z + v2.x * g2z );
    		}

    		this._integral[0] *= 1 / 6;
    		this._integral[1] *= 1 / 24;
    		this._integral[2] *= 1 / 24;
    		this._integral[3] *= 1 / 24;
    		this._integral[4] *= 1 / 60;
    		this._integral[5] *= 1 / 60;
    		this._integral[6] *= 1 / 60;
    		this._integral[7] *= 1 / 120;
    		this._integral[8] *= 1 / 120;
    		this._integral[9] *= 1 / 120;

    		this.volume = this._integral[0];

    		this.center_of_mass.x = this._integral[1] / this.volume;
    		this.center_of_mass.y = this._integral[2] / this.volume;
    		this.center_of_mass.z = this._integral[3] / this.volume;
    	};
    })();

    Goblin.ConvexShape.prototype.getInertiaTensor = (function(){
    	return function( mass ) {
    		var	inertia_tensor = new Goblin.Matrix3();
    		mass /= this.volume;

    		inertia_tensor.e00 = ( this._integral[5] + this._integral[6] ) * mass;
    		inertia_tensor.e11 = ( this._integral[4] + this._integral[6] ) * mass;
    		inertia_tensor.e22 = ( this._integral[4] + this._integral[5] ) * mass;
    		inertia_tensor.e10 = inertia_tensor.e01 = -this._integral[7] * mass; //xy
    		inertia_tensor.e21 = inertia_tensor.e12 = -this._integral[8] * mass; //yz
    		inertia_tensor.e20 = inertia_tensor.e02 = -this._integral[9] * mass; //xz

    		inertia_tensor.e00 -= mass * ( this.center_of_mass.y * this.center_of_mass.y + this.center_of_mass.z * this.center_of_mass.z );
    		inertia_tensor.e11 -= mass * ( this.center_of_mass.x * this.center_of_mass.x + this.center_of_mass.z * this.center_of_mass.z );
    		inertia_tensor.e22 -= mass * ( this.center_of_mass.x * this.center_of_mass.x + this.center_of_mass.y * this.center_of_mass.y );

    		inertia_tensor.e10 += mass * this.center_of_mass.x * this.center_of_mass.y;
    		inertia_tensor.e01 += mass * this.center_of_mass.x * this.center_of_mass.y;

    		inertia_tensor.e21 += mass * this.center_of_mass.y * this.center_of_mass.z;
    		inertia_tensor.e12 += mass * this.center_of_mass.y * this.center_of_mass.z;

    		inertia_tensor.e20 += mass * this.center_of_mass.x * this.center_of_mass.z;
    		inertia_tensor.e02 += mass * this.center_of_mass.x * this.center_of_mass.z;

    		return inertia_tensor;
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
    Goblin.ConvexShape.prototype.findSupportPoint = function( direction, support_point ) {
    	var best,
    		best_dot = -Infinity,
    		dot;

    	for ( var i = 0; i < this.vertices.length; i++ ) {
    		dot = this.vertices[i].dot( direction );
    		if ( dot > best_dot ) {
    			best_dot = dot;
    			best = i;
    		}
    	}

    	support_point.copy( this.vertices[best] );
    };

    /**
     * Checks if a ray segment intersects with the shape
     *
     * @method rayIntersect
     * @property start {vec3} start point of the segment
     * @property end {vec3{ end point of the segment
     * @return {RayIntersection|null} if the segment intersects, a RayIntersection is returned, else `null`
     */
    Goblin.ConvexShape.prototype.rayIntersect = (function(){
    	var direction = new Goblin.Vector3(),
    		ab = new Goblin.Vector3(),
    		ac = new Goblin.Vector3(),
    		q = new Goblin.Vector3(),
    		s = new Goblin.Vector3(),
    		r = new Goblin.Vector3(),
    		b = new Goblin.Vector3(),
    		u = new Goblin.Vector3(),
    		tmin, tmax;

    	return function( start, end ) {
    		tmin = 0;

    		direction.subtractVectors( end, start );
    		tmax = direction.length();
    		direction.scale( 1 / tmax ); // normalize direction

    		for ( var i = 0; i < this.faces.length; i++  ) {
    			var face = this.faces[i];

    			ab.subtractVectors( face.b.point, face.a.point );
    			ac.subtractVectors( face.c.point, face.a.point );
    			q.crossVectors( direction, ac );
    			var a = ab.dot( q );

    			if ( a < Goblin.EPSILON ) {
    				// Ray does not point at face
    				continue;
    			}

    			var f = 1 / a;
    			s.subtractVectors( start, face.a.point );

    			var u = f * s.dot( q );
    			if ( u < 0 ) {
    				// Ray does not intersect face
    				continue;
    			}

    			r.crossVectors( s, ab );
    			var v = f * direction.dot( r );
    			if ( v < 0 || u + v > 1 ) {
    				// Ray does not intersect face
    				continue;
    			}

    			var t = f * ac.dot( r );
    			if ( t < tmin || t > tmax ) {
    				// ray segment does not intersect face
    				continue;
    			}

    			// Segment intersects the face, find from `t`
    			var intersection = Goblin.ObjectPool.getObject( 'RayIntersection' );
    			intersection.object = this;
    			intersection.t = t;
    			intersection.point.scaleVector( direction, t );
    			intersection.point.add( start );
    			intersection.normal.copy( face.normal );

    			// A convex object can have only one intersection with a line, we're done
    			return intersection;
    		}

    		// No intersection found
    		return null;
    	};
    })();
    /**
     * @class CylinderShape
     * @param radius {Number} radius of the cylinder
     * @param half_height {Number} half height of the cylinder
     * @constructor
     */
    Goblin.CylinderShape = function( radius, half_height ) {
    	/**
    	 * radius of the cylinder
    	 *
    	 * @property radius
    	 * @type {Number}
    	 */
    	this.radius = radius;

    	/**
    	 * half height of the cylinder
    	 *
    	 * @property half_height
    	 * @type {Number}
    	 */
    	this.half_height = half_height;

        this.aabb = new Goblin.AABB();
        this.calculateLocalAABB( this.aabb );
    };

    /**
     * Calculates this shape's local AABB and stores it in the passed AABB object
     *
     * @method calculateLocalAABB
     * @param aabb {AABB}
     */
    Goblin.CylinderShape.prototype.calculateLocalAABB = function( aabb ) {
        aabb.min.x = aabb.min.z = -this.radius;
        aabb.min.y = -this.half_height;

        aabb.max.x = aabb.max.z = this.radius;
        aabb.max.y = this.half_height;
    };

    Goblin.CylinderShape.prototype.getInertiaTensor = function( mass ) {
    	var element = 0.0833 * mass * ( 3 * this.radius * this.radius + ( this.half_height + this.half_height ) * ( this.half_height + this.half_height ) );

    	return new Goblin.Matrix3(
    		element, 0, 0,
    		0, 0.5 * mass * this.radius * this.radius, 0,
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
    Goblin.CylinderShape.prototype.findSupportPoint = function( direction, support_point ) {
    	// Calculate the support point in the local frame
    	if ( direction.y < 0 ) {
    		support_point.y = -this.half_height;
    	} else {
    		support_point.y = this.half_height;
    	}

    	if ( direction.x === 0 && direction.z === 0 ) {
    		support_point.x = support_point.z = 0;
    	} else {
    		var sigma = Math.sqrt( direction.x * direction.x + direction.z * direction.z ),
    			r_s = this.radius / sigma;
    		support_point.x = r_s * direction.x;
    		support_point.z = r_s * direction.z;
    	}
    };

    /**
     * Checks if a ray segment intersects with the shape
     *
     * @method rayIntersect
     * @property start {vec3} start point of the segment
     * @property end {vec3{ end point of the segment
     * @return {RayIntersection|null} if the segment intersects, a RayIntersection is returned, else `null`
     */
    Goblin.CylinderShape.prototype.rayIntersect = (function(){
    	var p = new Goblin.Vector3(),
    		q = new Goblin.Vector3();

    	return function ( start, end ) {
    		p.y = this.half_height;
    		q.y = -this.half_height;

    		var d = new Goblin.Vector3();
    		d.subtractVectors( q, p );

    		var m = new Goblin.Vector3();
    		m.subtractVectors( start, p );

    		var n = new Goblin.Vector3();
    		n.subtractVectors( end, start );

    		var md = m.dot( d ),
    			nd = n.dot( d ),
    			dd = d.dot( d );

    		// Test if segment fully outside either endcap of cylinder
    		if ( md < 0 && md + nd < 0 ) {
    			return null; // Segment outside 'p' side of cylinder
    		}
    		if ( md > dd && md + nd > dd ) {
    			return null; // Segment outside 'q' side of cylinder
    		}

    		var nn = n.dot( n ),
    			mn = m.dot( n ),
    			a = dd * nn - nd * nd,
    			k = m.dot( m ) - this.radius * this.radius,
    			c = dd * k - md * md,
    			t, t0;

    		if ( Math.abs( a ) < Goblin.EPSILON ) {
    			// Segment runs parallel to cylinder axis
    			if ( c > 0 ) {
    				return null; // 'a' and thus the segment lie outside cylinder
    			}

    			// Now known that segment intersects cylinder; figure out how it intersects
    			if ( md < 0 ) {
    				t = -mn / nn; // Intersect segment against 'p' endcap
    			} else if ( md > dd ) {
    				t = (nd - mn) / nn; // Intersect segment against 'q' endcap
    			} else {
    				t = 0; // 'a' lies inside cylinder
    			}
    		} else {
    			var b = dd * mn - nd * md,
    				discr = b * b - a * c;

    			if ( discr < 0 ) {
    				return null; // No real roots; no intersection
    			}

    			t0 = t = ( -b - Math.sqrt( discr ) ) / a;

    			if ( md + t * nd < 0 ) {
    				// Intersection outside cylinder on 'p' side
    				if ( nd <= 0 ) {
    					return null; // Segment pointing away from endcap
    				}
    				t = -md / nd;
    				// Keep intersection if Dot(S(t) - p, S(t) - p) <= r^2
    				if ( k + t * ( 2 * mn + t * nn ) <= 0 ) {
    					t0 = t;
    				} else {
    					return null;
    				}
    			} else if ( md + t * nd > dd ) {
    				// Intersection outside cylinder on 'q' side
    				if ( nd >= 0 ) {
    					return null; // Segment pointing away from endcap
    				}
    				t = ( dd - md ) / nd;
    				// Keep intersection if Dot(S(t) - q, S(t) - q) <= r^2
    				if ( k + dd - 2 * md + t * ( 2 * ( mn - nd ) + t * nn ) <= 0 ) {
    					t0 = t;
    				} else {
    					return null;
    				}
    			}
    			t = t0;

    			// Intersection if segment intersects cylinder between the end-caps
    			if ( t < 0 || t > 1 ) {
    				return null;
    			}
    		}

    		// Segment intersects cylinder between the endcaps; t is correct
    		var intersection = Goblin.ObjectPool.getObject( 'RayIntersection' );
    		intersection.object = this;
    		intersection.t = t * n.length();
    		intersection.point.scaleVector( n, t );
    		intersection.point.add( start );

    		if ( Math.abs( intersection.point.y - this.half_height ) <= Goblin.EPSILON ) {
    			intersection.normal.x = intersection.normal.z = 0;
    			intersection.normal.y = intersection.point.y < 0 ? -1 : 1;
    		} else {
    			intersection.normal.y = 0;
    			intersection.normal.x = intersection.point.x;
    			intersection.normal.z = intersection.point.z;
    			intersection.normal.scale( 1 / this.radius );
    		}

    		return intersection;
    	};
    })( );
    /**
     * @class MeshShape
     * @param vertices {Array<Vector3>} vertices comprising the mesh
     * @param faces {Array<Number>} array of indices indicating which vertices compose a face; faces[0..2] represent the first face, faces[3..5] are the second, etc
     * @constructor
     */
    Goblin.MeshShape = function( vertices, faces ) {
    	this.vertices = vertices;

    	this.triangles = [];
    	for ( var i = 0; i < faces.length; i += 3 ) {
    		this.triangles.push( new Goblin.TriangleShape( vertices[faces[i]], vertices[faces[i+1]], vertices[faces[i+2]] ) );
    	}

    	/**
    	 * the convex mesh's volume
    	 * @property volume
    	 * @type {number}
    	 */
    	this.volume = 0;

    	/**
    	 * coordinates of the mesh's COM
    	 * @property center_of_mass
    	 * @type {vec3}
    	 */
    	this.center_of_mass = new Goblin.Vector3();

    	/**
    	 * used in computing the mesh's center of mass & volume
    	 * @property _intergral
    	 * @type {Float32Array}
    	 * @private
    	 */
    	this._integral = new Float32Array( 10 );

    	this.hierarchy = new Goblin.BVH( this.triangles ).tree;

    	var polygon_faces = this.triangles.map(
    		function( triangle ) {
    			return new Goblin.GjkEpa.Face(
    				null,
    				{ point: triangle.a },
    				{ point: triangle.b },
    				{ point: triangle.c }
    			);
    		}
    	);

    	Goblin.ConvexShape.prototype.computeVolume.call( this, polygon_faces );

    	this.aabb = new Goblin.AABB();
    	this.calculateLocalAABB( this.aabb );
    };

    /**
     * Calculates this shape's local AABB and stores it in the passed AABB object
     *
     * @method calculateLocalAABB
     * @param aabb {AABB}
     */
    Goblin.MeshShape.prototype.calculateLocalAABB = function( aabb ) {
    	aabb.min.x = aabb.min.y = aabb.min.z = 0;
    	aabb.max.x = aabb.max.y = aabb.max.z = 0;

    	for ( var i = 0; i < this.vertices.length; i++ ) {
    		aabb.min.x = Math.min( aabb.min.x, this.vertices[i].x );
    		aabb.min.y = Math.min( aabb.min.y, this.vertices[i].y );
    		aabb.min.z = Math.min( aabb.min.z, this.vertices[i].z );

    		aabb.max.x = Math.max( aabb.max.x, this.vertices[i].x );
    		aabb.max.y = Math.max( aabb.max.y, this.vertices[i].y );
    		aabb.max.z = Math.max( aabb.max.z, this.vertices[i].z );
    	}
    };

    Goblin.MeshShape.prototype.getInertiaTensor = function( mass ) {
    	return Goblin.ConvexShape.prototype.getInertiaTensor.call( this, mass );
    };

    /**
     * noop
     *
     * @method findSupportPoint
     * @param direction {vec3} direction to use in finding the support point
     * @param support_point {vec3} vec3 variable which will contain the supporting point after calling this method
     */
    Goblin.MeshShape.prototype.findSupportPoint = function( direction, support_point ) {
    	return; // MeshShape isn't convex so it cannot be used directly in GJK
    };

    /**
     * Checks if a ray segment intersects with the shape
     *
     * @method rayIntersect
     * @property start {vec3} start point of the segment
     * @property end {vec3} end point of the segment
     * @return {RayIntersection|null} if the segment intersects, a RayIntersection is returned, else `null`
     */
    Goblin.MeshShape.prototype.rayIntersect = (function(){
    	var intersections = [],
    		tSort = function( a, b ) {
    			if ( a.t < b.t ) {
    				return -1;
    			} else if ( a.t > b.t ) {
    				return 1;
    			} else {
    				return 0;
    			}
    		};

    	return function( start, end ) {
    		// Traverse the BVH and return the closest point of contact, if any
    		var nodes = [ this.hierarchy ],
    			node;
    		intersections.length = 0;

    		var count = 0;
    		while ( nodes.length > 0 ) {
    			count++;
    			node = nodes.shift();

    			if ( node.aabb.testRayIntersect( start, end ) ) {
    				// Ray intersects this node's AABB
    				if ( node.isLeaf() ) {
    					var intersection = node.object.rayIntersect( start, end );
    					if ( intersection != null ) {
    						intersections.push( intersection );
    					}
    				} else {
    					nodes.push( node.left, node.right );
    				}
    			}
    		}

    		intersections.sort( tSort );
    		return intersections[0] || null;
    	};
    })();
    /**
     * @class PlaneShape
     * @param orientation {Number} index of axis which is the plane's normal ( 0 = X, 1 = Y, 2 = Z )
     * @param half_width {Number} half width of the plane
     * @param half_length {Number} half height of the plane
     * @constructor
     */
    Goblin.PlaneShape = function( orientation, half_width, half_length ) {
    	/**
    	 * index of axis which is the plane's normal ( 0 = X, 1 = Y, 2 = Z )
    	 * when 0, width is Y and length is Z
    	 * when 1, width is X and length is Z
    	 * when 2, width is X and length is Y
    	 *
    	 * @property half_width
    	 * @type {Number}
    	 */
    	this.orientation = orientation;

    	/**
    	 * half width of the plane
    	 *
    	 * @property half_height
    	 * @type {Number}
    	 */
    	this.half_width = half_width;

    	/**
    	 * half length of the plane
    	 *
    	 * @property half_length
    	 * @type {Number}
    	 */
    	this.half_length = half_length;

        this.aabb = new Goblin.AABB();
        this.calculateLocalAABB( this.aabb );


    	if ( this.orientation === 0 ) {
    		this._half_width = 0;
    		this._half_height = this.half_width;
    		this._half_depth = this.half_length;
    	} else if ( this.orientation === 1 ) {
    		this._half_width = this.half_width;
    		this._half_height = 0;
    		this._half_depth = this.half_length;
    	} else {
    		this._half_width = this.half_width;
    		this._half_height = this.half_length;
    		this._half_depth = 0;
    	}
    };

    /**
     * Calculates this shape's local AABB and stores it in the passed AABB object
     *
     * @method calculateLocalAABB
     * @param aabb {AABB}
     */
    Goblin.PlaneShape.prototype.calculateLocalAABB = function( aabb ) {
        if ( this.orientation === 0 ) {
            this._half_width = 0;
            this._half_height = this.half_width;
            this._half_depth = this.half_length;

            aabb.min.x = 0;
            aabb.min.y = -this.half_width;
            aabb.min.z = -this.half_length;

            aabb.max.x = 0;
            aabb.max.y = this.half_width;
            aabb.max.z = this.half_length;
        } else if ( this.orientation === 1 ) {
            this._half_width = this.half_width;
            this._half_height = 0;
            this._half_depth = this.half_length;

            aabb.min.x = -this.half_width;
            aabb.min.y = 0;
            aabb.min.z = -this.half_length;

            aabb.max.x = this.half_width;
            aabb.max.y = 0;
            aabb.max.z = this.half_length;
        } else {
            this._half_width = this.half_width;
            this._half_height = this.half_length;
            this._half_depth = 0;

            aabb.min.x = -this.half_width;
            aabb.min.y = -this.half_length;
            aabb.min.z = 0;

            aabb.max.x = this.half_width;
            aabb.max.y = this.half_length;
            aabb.max.z = 0;
        }
    };

    Goblin.PlaneShape.prototype.getInertiaTensor = function( mass ) {
    	var width_squared = this.half_width * this.half_width * 4,
    		length_squared = this.half_length * this.half_length * 4,
    		element = 0.0833 * mass,

    		x = element * length_squared,
    		y = element * ( width_squared + length_squared ),
    		z = element * width_squared;

    	if ( this.orientation === 0 ) {
    		return new Goblin.Matrix3(
    			y, 0, 0,
    			0, x, 0,
    			0, 0, z
    		);
    	} else if ( this.orientation === 1 ) {
    		return new Goblin.Matrix3(
    			x, 0, 0,
    			0, y, 0,
    			0, 0, z
    		);
    	} else {
    		return new Goblin.Matrix3(
    			y, 0, 0,
    			0, z, 0,
    			0, 0, x
    		);
    	}
    };

    /**
     * Given `direction`, find the point in this body which is the most extreme in that direction.
     * This support point is calculated in world coordinates and stored in the second parameter `support_point`
     *
     * @method findSupportPoint
     * @param direction {vec3} direction to use in finding the support point
     * @param support_point {vec3} vec3 variable which will contain the supporting point after calling this method
     */
    Goblin.PlaneShape.prototype.findSupportPoint = function( direction, support_point ) {
    	/*
    	 support_point = [
    	 sign( direction.x ) * _half_width,
    	 sign( direction.y ) * _half_height,
    	 sign( direction.z ) * _half_depth
    	 ]
    	 */

    	// Calculate the support point in the local frame
    	if ( direction.x < 0 ) {
    		support_point.x = -this._half_width;
    	} else {
    		support_point.x = this._half_width;
    	}

    	if ( direction.y < 0 ) {
    		support_point.y = -this._half_height;
    	} else {
    		support_point.y = this._half_height;
    	}

    	if ( direction.z < 0 ) {
    		support_point.z = -this._half_depth;
    	} else {
    		support_point.z = this._half_depth;
    	}
    };

    /**
     * Checks if a ray segment intersects with the shape
     *
     * @method rayIntersect
     * @property start {vec3} start point of the segment
     * @property end {vec3{ end point of the segment
     * @return {RayIntersection|null} if the segment intersects, a RayIntersection is returned, else `null`
     */
    Goblin.PlaneShape.prototype.rayIntersect = (function(){
    	var normal = new Goblin.Vector3(),
    		ab = new Goblin.Vector3(),
    		point = new Goblin.Vector3(),
    		t;

    	return function( start, end ) {
    		if ( this.orientation === 0 ) {
    			normal.x = 1;
    			normal.y = normal.z = 0;
    		} else if ( this.orientation === 1 ) {
    			normal.y = 1;
    			normal.x = normal.z = 0;
    		} else {
    			normal.z = 1;
    			normal.x = normal.y = 0;
    		}

    		ab.subtractVectors( end, start );
    		t = -normal.dot( start ) / normal.dot( ab );

    		if ( t < 0 || t > 1 ) {
    			return null;
    		}

    		point.scaleVector( ab, t );
    		point.add( start );

    		if ( point.x < -this._half_width || point.x > this._half_width ) {
    			return null;
    		}

    		if ( point.y < -this._half_height || point.y > this._half_height ) {
    			return null;
    		}

    		if ( point.z < -this._half_depth || point.z > this._half_depth ) {
    			return null;
    		}

    		var intersection = Goblin.ObjectPool.getObject( 'RayIntersection' );
    		intersection.object = this;
    		intersection.t = t * ab.length();
    		intersection.point.copy( point );
    		intersection.normal.copy( normal );

    		return intersection;
    	};
    })();
    /**
     * @class SphereShape
     * @param radius {Number} sphere radius
     * @constructor
     */
    Goblin.SphereShape = function( radius ) {
    	this.radius = radius;

    	this.aabb = new Goblin.AABB();
    	this.calculateLocalAABB( this.aabb );
    };

    /**
     * Calculates this shape's local AABB and stores it in the passed AABB object
     *
     * @method calculateLocalAABB
     * @param aabb {AABB}
     */
    Goblin.SphereShape.prototype.calculateLocalAABB = function( aabb ) {
    	aabb.min.x = aabb.min.y = aabb.min.z = -this.radius;
    	aabb.max.x = aabb.max.y = aabb.max.z = this.radius;
    };

    Goblin.SphereShape.prototype.getInertiaTensor = function( mass ) {
    	var element = 0.4 * mass * this.radius * this.radius;
    	return new Goblin.Matrix3(
    		element, 0, 0,
    		0, element, 0,
    		0, 0, element
    	);
    };

    /**
     * Given `direction`, find the point in this body which is the most extreme in that direction.
     * This support point is calculated in local coordinates and stored in the second parameter `support_point`
     *
     * @method findSupportPoint
     * @param direction {vec3} direction to use in finding the support point
     * @param support_point {vec3} vec3 variable which will contain the supporting point after calling this method
     */
    Goblin.SphereShape.prototype.findSupportPoint = (function(){
    	var temp = new Goblin.Vector3();
    	return function( direction, support_point ) {
    		temp.normalizeVector( direction );
    		support_point.scaleVector( temp, this.radius );
    	};
    })();

    /**
     * Checks if a ray segment intersects with the shape
     *
     * @method rayIntersect
     * @property start {vec3} start point of the segment
     * @property end {vec3{ end point of the segment
     * @return {RayIntersection|null} if the segment intersects, a RayIntersection is returned, else `null`
     */
    Goblin.SphereShape.prototype.rayIntersect = (function(){
    	var direction = new Goblin.Vector3(),
    		length;

    	return function( start, end ) {
    		direction.subtractVectors( end, start );
    		length = direction.length();
    		direction.scale( 1 / length  ); // normalize direction

    		var a = start.dot( direction ),
    			b = start.dot( start ) - this.radius * this.radius;

    		// if ray starts outside of sphere and points away, exit
    		if ( a >= 0 && b >= 0 ) {
    			return null;
    		}

    		var discr = a * a - b;

    		// Check for ray miss
    		if ( discr < 0 ) {
    			return null;
    		}

    		// ray intersects, find closest intersection point
    		var discr_sqrt = Math.sqrt( discr ),
    			t = -a - discr_sqrt;
    		if ( t < 0 ) {
    			t = -a + discr_sqrt;
    		}

    		// verify the segment intersects
    		if ( t > length ) {
    			return null;
    		}

    		var intersection = Goblin.ObjectPool.getObject( 'RayIntersection' );
    		intersection.object = this;
    		intersection.point.scaleVector( direction, t );
    		intersection.t = t;
    		intersection.point.add( start );

            intersection.normal.normalizeVector( intersection.point );

    		return intersection;
    	};
    })();
    /**
     * @class TriangleShape
     * @param vertex_a {Vector3} first vertex
     * @param vertex_b {Vector3} second vertex
     * @param vertex_c {Vector3} third vertex
     * @constructor
     */
    Goblin.TriangleShape = function( vertex_a, vertex_b, vertex_c ) {
    	/**
    	 * first vertex of the triangle
    	 *
    	 * @property a
    	 * @type {Vector3}
    	 */
    	this.a = vertex_a;

    	/**
    	 * second vertex of the triangle
    	 *
    	 * @property b
    	 * @type {Vector3}
    	 */
    	this.b = vertex_b;

    	/**
    	 * third vertex of the triangle
    	 *
    	 * @property c
    	 * @type {Vector3}
    	 */
    	this.c = vertex_c;

    	/**
    	 * normal vector of the triangle
    	 *
    	 * @property normal
    	 * @type {Goblin.Vector3}
    	 */
    	this.normal = new Goblin.Vector3();
    	_tmp_vec3_1.subtractVectors( this.b, this.a );
    	_tmp_vec3_2.subtractVectors( this.c, this.a );
    	this.normal.crossVectors( _tmp_vec3_1, _tmp_vec3_2 );

    	/**
    	 * area of the triangle
    	 *
    	 * @property volume
    	 * @type {Number}
    	 */
    	this.volume = this.normal.length() / 2;

    	this.normal.normalize();

    	this.aabb = new Goblin.AABB();
    	this.calculateLocalAABB( this.aabb );
    };

    /**
     * Calculates this shape's local AABB and stores it in the passed AABB object
     *
     * @method calculateLocalAABB
     * @param aabb {AABB}
     */
    Goblin.TriangleShape.prototype.calculateLocalAABB = function( aabb ) {
    	aabb.min.x = Math.min( this.a.x, this.b.x, this.c.x );
    	aabb.min.y = Math.min( this.a.y, this.b.y, this.c.y );
    	aabb.min.z = Math.min( this.a.z, this.b.z, this.c.z );

    	aabb.max.x = Math.max( this.a.x, this.b.x, this.c.x );
    	aabb.max.y = Math.max( this.a.y, this.b.y, this.c.y );
    	aabb.max.z = Math.max( this.a.z, this.b.z, this.c.z );
    };

    Goblin.TriangleShape.prototype.getInertiaTensor = function( mass ) {
    	// @TODO http://www.efunda.com/math/areas/triangle.cfm
    	return new Goblin.Matrix3(
    		0, 0, 0,
    		0, 0, 0,
    		0, 0, 0
    	);
    };

    Goblin.TriangleShape.prototype.classifyVertex = function( vertex ) {
    	var w = this.normal.dot( this.a );
    	return this.normal.dot( vertex ) - w;
    };

    /**
     * Given `direction`, find the point in this body which is the most extreme in that direction.
     * This support point is calculated in world coordinates and stored in the second parameter `support_point`
     *
     * @method findSupportPoint
     * @param direction {vec3} direction to use in finding the support point
     * @param support_point {vec3} vec3 variable which will contain the supporting point after calling this method
     */
    Goblin.TriangleShape.prototype.findSupportPoint = function( direction, support_point ) {
    	var dot, best_dot = -Infinity;

    	dot = direction.dot( this.a );
    	if ( dot > best_dot ) {
    		support_point.copy( this.a );
    		best_dot = dot;
    	}

    	dot = direction.dot( this.b );
    	if ( dot > best_dot ) {
    		support_point.copy( this.b );
    		best_dot = dot;
    	}

    	dot = direction.dot( this.c );
    	if ( dot > best_dot ) {
    		support_point.copy( this.c );
    	}
    };

    /**
     * Checks if a ray segment intersects with the shape
     *
     * @method rayIntersect
     * @property start {vec3} start point of the segment
     * @property end {vec3{ end point of the segment
     * @return {RayIntersection|null} if the segment intersects, a RayIntersection is returned, else `null`
     */
    Goblin.TriangleShape.prototype.rayIntersect = (function(){
    	var d1 = new Goblin.Vector3(),
    		d2 = new Goblin.Vector3(),
    		n = new Goblin.Vector3(),
    		segment = new Goblin.Vector3(),
    		b = new Goblin.Vector3(),
    		u = new Goblin.Vector3();

    	return function( start, end ) {
    		d1.subtractVectors( this.b, this.a );
    		d2.subtractVectors( this.c, this.a );
    		n.crossVectors( d1, d2 );

    		segment.subtractVectors( end, start );
    		var det = -segment.dot( n );

    		if ( det <= 0 ) {
    			// Ray is parallel to triangle or triangle's normal points away from ray
    			return null;
    		}

    		b.subtractVectors( start, this.a );

    		var t = b.dot( n ) / det;
    		if ( 0 > t || t > 1 ) {
    			// Ray doesn't intersect the triangle's plane
    			return null;
    		}

    		u.crossVectors( b, segment );
    		var u1 = d2.dot( u ) / det,
    			u2 = -d1.dot( u ) / det;

    		if ( u1 + u2 > 1 || u1 < 0 || u2 < 0 ) {
    			// segment does not intersect triangle
    			return null;
    		}

    		var intersection = Goblin.ObjectPool.getObject( 'RayIntersection' );
    		intersection.object = this;
    		intersection.t = t * segment.length();
    		intersection.point.scaleVector( segment, t );
    		intersection.point.add( start );
    		intersection.normal.copy( this.normal );

    		return intersection;
    	};
    })();
    Goblin.CollisionUtils = {};

    Goblin.CollisionUtils.canBodiesCollide = function( object_a, object_b ) {
    	if ( object_a._mass === Infinity && object_b._mass === Infinity ) {
    		// Two static objects aren't considered to be in contact
    		return false;
    	}

    	// Check collision masks
    	if ( object_a.collision_mask !== 0 ) {
    		if ( ( object_a.collision_mask & 1 ) === 0 ) {
    			// object_b must not be in a matching group
    			if ( ( object_a.collision_mask & object_b.collision_groups ) !== 0 ) {
    				return false;
    			}
    		} else {
    			// object_b must be in a matching group
    			if ( ( object_a.collision_mask & object_b.collision_groups ) === 0 ) {
    				return false;
    			}
    		}
    	}
    	if ( object_b.collision_mask !== 0 ) {
    		if ( ( object_b.collision_mask & 1 ) === 0 ) {
    			// object_a must not be in a matching group
    			if ( ( object_b.collision_mask & object_a.collision_groups ) !== 0 ) {
    				return false;
    			}
    		} else {
    			// object_a must be in a matching group
    			if ( ( object_b.collision_mask & object_a.collision_groups ) === 0 ) {
    				return false;
    			}
    		}
    	}

    	return true;
    };
    /**
     * Provides methods useful for working with various types of geometries
     *
     * @class GeometryMethods
     * @static
     */
    Goblin.GeometryMethods = {
    	/**
    	 * determines the location in a triangle closest to a given point
    	 *
    	 * @method findClosestPointInTriangle
    	 * @param {vec3} p point
    	 * @param {vec3} a first triangle vertex
    	 * @param {vec3} b second triangle vertex
    	 * @param {vec3} c third triangle vertex
    	 * @param {vec3} out vector where the result will be stored
    	 */
    	findClosestPointInTriangle: (function() {
    		var ab = new Goblin.Vector3(),
    			ac = new Goblin.Vector3(),
    			_vec = new Goblin.Vector3();

    		return function( p, a, b, c, out ) {
    			var v;

    			// Check if P in vertex region outside A
    			ab.subtractVectors( b, a );
    			ac.subtractVectors( c, a );
    			_vec.subtractVectors( p, a );
    			var d1 = ab.dot( _vec ),
    				d2 = ac.dot( _vec );
    			if ( d1 <= 0 && d2 <= 0 ) {
    				out.copy( a );
    				return;
    			}

    			// Check if P in vertex region outside B
    			_vec.subtractVectors( p, b );
    			var d3 = ab.dot( _vec ),
    				d4 = ac.dot( _vec );
    			if ( d3 >= 0 && d4 <= d3 ) {
    				out.copy( b );
    				return;
    			}

    			// Check if P in edge region of AB
    			var vc = d1*d4 - d3*d2;
    			if ( vc <= 0 && d1 >= 0 && d3 <= 0 ) {
    				v = d1 / ( d1 - d3 );
    				out.scaleVector( ab, v );
    				out.add( a );
    				return;
    			}

    			// Check if P in vertex region outside C
    			_vec.subtractVectors( p, c );
    			var d5 = ab.dot( _vec ),
    				d6 = ac.dot( _vec );
    			if ( d6 >= 0 && d5 <= d6 ) {
    				out.copy( c );
    				return;
    			}

    			// Check if P in edge region of AC
    			var vb = d5*d2 - d1*d6,
    				w;
    			if ( vb <= 0 && d2 >= 0 && d6 <= 0 ) {
    				w = d2 / ( d2 - d6 );
    				out.scaleVector( ac, w );
    				out.add( a );
    				return;
    			}

    			// Check if P in edge region of BC
    			var va = d3*d6 - d5*d4;
    			if ( va <= 0 && d4-d3 >= 0 && d5-d6 >= 0 ) {
    				w = (d4 - d3) / ( (d4-d3) + (d5-d6) );
    				out.subtractVectors( c, b );
    				out.scale( w );
    				out.add( b );
    				return;
    			}

    			// P inside face region
    			var denom = 1 / ( va + vb + vc );
    			v = vb * denom;
    			w = vc * denom;


    			// At this point `ab` and `ac` can be recycled and lose meaning to their nomenclature

    			ab.scale( v );
    			ab.add( a );

    			ac.scale( w );

    			out.addVectors( ab, ac );
    		};
    	})(),

    	/**
    	 * Finds the Barycentric coordinates of point `p` in the triangle `a`, `b`, `c`
    	 *
    	 * @method findBarycentricCoordinates
    	 * @param p {vec3} point to calculate coordinates of
    	 * @param a {vec3} first point in the triangle
    	 * @param b {vec3} second point in the triangle
    	 * @param c {vec3} third point in the triangle
    	 * @param out {vec3} resulting Barycentric coordinates of point `p`
    	 */
    	findBarycentricCoordinates: function( p, a, b, c, out ) {

    		var v0 = new Goblin.Vector3(),
    			v1 = new Goblin.Vector3(),
    			v2 = new Goblin.Vector3();

    		v0.subtractVectors( b, a );
    		v1.subtractVectors( c, a );
    		v2.subtractVectors( p, a );

    		var d00 = v0.dot( v0 ),
    			d01 = v0.dot( v1 ),
    			d11 = v1.dot( v1 ),
    			d20 = v2.dot( v0 ),
    			d21 = v2.dot( v1 ),
    			denom = d00 * d11 - d01 * d01;

    		out.y = ( d11 * d20 - d01 * d21 ) / denom;
    		out.z = ( d00 * d21 - d01 * d20 ) / denom;
    		out.x = 1 - out.y - out.z;
    	},

    	/**
    	 * Calculates the distance from point `p` to line `ab`
    	 * @param p {vec3} point to calculate distance to
    	 * @param a {vec3} first point in line
    	 * @param b [vec3] second point in line
    	 * @returns {number}
    	 */
    	findSquaredDistanceFromSegment: (function(){
    		var ab = new Goblin.Vector3(),
    			ap = new Goblin.Vector3(),
    			bp = new Goblin.Vector3();

    		return function( p, a, b ) {
    			ab.subtractVectors( a, b );
    			ap.subtractVectors( a, p );
    			bp.subtractVectors( b, p );

    			var e = ap.dot( ab );
    			if ( e <= 0 ) {
    				return ap.dot( ap );
    			}

    			var f = ab.dot( ab );
    			if ( e >= f ) {
    				return bp.dot( bp );
    			}

    			return ap.dot( ap ) - e * e / f;
    		};
    	})(),

    	findClosestPointsOnSegments: (function(){
    		var d1 = new Goblin.Vector3(),
    			d2 = new Goblin.Vector3(),
    			r = new Goblin.Vector3(),
    			clamp = function( x, min, max ) {
    				return Math.min( Math.max( x, min ), max );
    			};

    		return function( aa, ab, ba, bb, p1, p2 ) {
    			d1.subtractVectors( ab, aa );
    			d2.subtractVectors( bb, ba );
    			r.subtractVectors( aa, ba );

    			var a = d1.dot( d1 ),
    				e = d2.dot( d2 ),
    				f = d2.dot( r );

    			var s, t;

    			if ( a <= Goblin.EPSILON && e <= Goblin.EPSILON ) {
    				// Both segments are degenerate
    				s = t = 0;
    				p1.copy( aa );
    				p2.copy( ba );
    				_tmp_vec3_1.subtractVectors( p1, p2 );
    				return _tmp_vec3_1.dot( _tmp_vec3_1 );
    			}

    			if ( a <= Goblin.EPSILON ) {
    				// Only first segment is degenerate
    				s = 0;
    				t = f / e;
    				t = clamp( t, 0, 1 );
    			} else {
    				var c = d1.dot( r );
    				if ( e <= Goblin.EPSILON ) {
    					// Second segment is degenerate
    					t = 0;
    					s = clamp( -c / a, 0, 1 );
    				} else {
    					// Neither segment is degenerate
    					var b = d1.dot( d2 ),
    						denom = a * e - b * b;

    					if ( denom !== 0 ) {
    						// Segments aren't parallel
    						s = clamp( ( b * f - c * e ) / denom, 0, 1 );
    					} else {
    						s = 0;
    					}

    					// find point on segment2 closest to segment1(s)
    					t = ( b * s + f ) / e;

    					// validate t, if it needs clamping then clamp and recompute s
    					if ( t < 0 ) {
    						t = 0;
    						s = clamp( -c / a, 0, 1 );
    					} else if ( t > 1 ) {
    						t = 1;
    						s = clamp( ( b - c ) / a, 0, 1 );
    					}
    				}
    			}

    			p1.scaleVector( d1, s );
    			p1.add( aa );

    			p2.scaleVector( d2, t );
    			p2.add( ba );

    			_tmp_vec3_1.subtractVectors( p1, p2 );
    			return _tmp_vec3_1.dot( _tmp_vec3_1 );
    		};
    	})()
    };
    (function(){
    	Goblin.MinHeap = function( array ) {
    		this.heap = array == null ? [] : array.slice();

    		if ( this.heap.length > 0 ) {
    			this.heapify();
    		}
    	};
    	Goblin.MinHeap.prototype = {
    		heapify: function() {
    			var start = ~~( ( this.heap.length - 2 ) / 2 );
    			while ( start >= 0 ) {
    				this.siftUp( start, this.heap.length - 1 );
    				start--;
    			}
    		},
    		siftUp: function( start, end ) {
    			var root = start;

    			while ( root * 2 + 1 <= end ) {
    				var child = root * 2 + 1;

    				if ( child + 1 <= end && this.heap[child + 1].valueOf() < this.heap[child].valueOf() ) {
    					child++;
    				}

    				if ( this.heap[child].valueOf() < this.heap[root].valueOf() ) {
    					var tmp = this.heap[child];
    					this.heap[child] = this.heap[root];
    					this.heap[root] = tmp;
    					root = child;
    				} else {
    					return;
    				}
    			}
    		},
    		push: function( item ) {
    			this.heap.push( item );

    			var root = this.heap.length - 1;
    			while ( root !== 0 ) {
    				var parent = ~~( ( root - 1 ) / 2 );

    				if ( this.heap[parent].valueOf() > this.heap[root].valueOf() ) {
    					var tmp = this.heap[parent];
    					this.heap[parent] = this.heap[root];
    					this.heap[root] = tmp;
    				}

    				root = parent;
    			}
    		},
    		peek: function() {
    			return this.heap.length > 0 ? this.heap[0] : null;
    		},
    		pop: function() {
    			var entry = this.heap[0];
    			this.heap[0] = this.heap[this.heap.length - 1];
    			this.heap.length = this.heap.length - 1;
    			this.siftUp( 0, this.heap.length - 1 );

    			return entry;
    		}
    	};
    })();
    Goblin.Utility = {
    	getUid: (function() {
    		var uid = 0;
    		return function() {
    			return uid++;
    		};
    	})()
    };
    /**
     * Extends a given shape by sweeping a line around it
     *
     * @class LineSweptShape
     * @param start {Vector3} starting point of the line
     * @param end {Vector3} line's end point
     * @param shape any Goblin shape object
     * @constructor
     */
    Goblin.LineSweptShape = function( start, end, shape ) {
    	/**
    	 * starting point of the line
    	 *
    	 * @property start
    	 * @type {Vector3}
    	 */
    	this.start = start;

    	/**
    	 * line's end point
    	 *
    	 * @property end
    	 * @type {Vector3}
    	 */
    	this.end = end;

    	/**
    	 * shape being swept
    	 *
    	 * @property shape
    	 */
    	this.shape = shape;

    	/**
    	 * unit direction of the line
    	 *
    	 * @property direction
    	 * @type {Vector3}
    	 */
    	this.direction = new Goblin.Vector3();
    	this.direction.subtractVectors( end, start );

    	/**
    	 * length of the line
    	 *
    	 * @property length
    	 * @type {Number}
    	 */
    	this.length = this.direction.length();
    	this.direction.normalize();

    	/**
    	 * axis-aligned bounding box of this shape
    	 *
    	 * @property aabb
    	 * @type {AABB}
    	 */
    	this.aabb = new Goblin.AABB();
    	this.calculateLocalAABB( this.aabb );
    };

    /**
     * Calculates this shape's local AABB and stores it in the passed AABB object
     *
     * @method calculateLocalAABB
     * @param aabb {AABB}
     */
    Goblin.LineSweptShape.prototype.calculateLocalAABB = function( aabb ) {
    	this.shape.calculateLocalAABB( aabb );

    	aabb.min.x = Math.min( aabb.min.x + this.start.x, aabb.min.x + this.end.x );
    	aabb.min.y = Math.min( aabb.min.y + this.start.y, aabb.min.y + this.end.y );
    	aabb.min.z = Math.min( aabb.min.z + this.start.z, aabb.min.z + this.end.z );

    	aabb.max.x = Math.max( aabb.max.x + this.start.x, aabb.max.x + this.end.x );
    	aabb.max.y = Math.max( aabb.max.y + this.start.y, aabb.max.y + this.end.y );
    	aabb.max.z = Math.max( aabb.max.z + this.start.z, aabb.max.z + this.end.z );
    };

    Goblin.LineSweptShape.prototype.getInertiaTensor = function( mass ) {
    	// this is wrong, but currently not used for anything
    	return this.shape.getInertiaTensor( mass );
    };

    /**
     * Given `direction`, find the point in this body which is the most extreme in that direction.
     * This support point is calculated in world coordinates and stored in the second parameter `support_point`
     *
     * @method findSupportPoint
     * @param direction {vec3} direction to use in finding the support point
     * @param support_point {vec3} vec3 variable which will contain the supporting point after calling this method
     */
    Goblin.LineSweptShape.prototype.findSupportPoint = function( direction, support_point ) {
    	this.shape.findSupportPoint( direction, support_point );

    	// Add whichever point of this line lies in `direction`
    	var dot = this.direction.dot( direction );

    	if ( dot < 0 ) {
    		support_point.add( this.start );
    	} else {
    		support_point.add( this.end );
    	}
    };

    /**
     * Checks if a ray segment intersects with the shape
     *
     * @method rayIntersect
     * @property start {vec3} start point of the segment
     * @property end {vec3} end point of the segment
     * @return {RayIntersection|null} if the segment intersects, a RayIntersection is returned, else `null`
     */
    Goblin.LineSweptShape.prototype.rayIntersect = function(){
    	return null;
    };
    /**
     * @class AABB
     * @param [min] {vec3}
     * @param [max] {vec3}
     * @constructor
     */
    Goblin.AABB = function( min, max ) {
    	/**
    	 * @property min
    	 * @type {vec3}
    	 */
    	this.min = min || new Goblin.Vector3();

    	/**
    	 * @property max
    	 * @type {vec3}
    	 */
    	this.max = max || new Goblin.Vector3();
    };

    Goblin.AABB.prototype.copy = function( aabb ) {
    	this.min.x = aabb.min.x;
    	this.min.y = aabb.min.y;
    	this.min.z = aabb.min.z;

    	this.max.x = aabb.max.x;
    	this.max.y = aabb.max.y;
    	this.max.z = aabb.max.z;
    };

    Goblin.AABB.prototype.combineAABBs = function( a, b ) {
    	this.min.x = Math.min( a.min.x, b.min.x );
    	this.min.y = Math.min( a.min.y, b.min.y );
    	this.min.z = Math.min( a.min.z, b.min.z );

    	this.max.x = Math.max( a.max.x, b.max.x );
    	this.max.y = Math.max( a.max.y, b.max.y );
    	this.max.z = Math.max( a.max.z, b.max.z );
    };

    Goblin.AABB.prototype.transform = (function(){
    	var local_half_extents = new Goblin.Vector3(),
    		local_center = new Goblin.Vector3(),
    		center = new Goblin.Vector3(),
    		extents = new Goblin.Vector3(),
    		abs = new Goblin.Matrix3();

    	return function( local_aabb, matrix ) {
    		local_half_extents.subtractVectors( local_aabb.max, local_aabb.min );
    		local_half_extents.scale( 0.5  );

    		local_center.addVectors( local_aabb.max, local_aabb.min );
    		local_center.scale( 0.5  );

    		matrix.transformVector3Into( local_center, center );

    		// Extract the absolute rotation matrix
    		abs.e00 = Math.abs( matrix.e00 );
    		abs.e01 = Math.abs( matrix.e01 );
    		abs.e02 = Math.abs( matrix.e02 );
    		abs.e10 = Math.abs( matrix.e10 );
    		abs.e11 = Math.abs( matrix.e11 );
    		abs.e12 = Math.abs( matrix.e12 );
    		abs.e20 = Math.abs( matrix.e20 );
    		abs.e21 = Math.abs( matrix.e21 );
    		abs.e22 = Math.abs( matrix.e22 );

    		_tmp_vec3_1.x = abs.e00;
    		_tmp_vec3_1.y = abs.e10;
    		_tmp_vec3_1.z = abs.e20;
    		extents.x = local_half_extents.dot( _tmp_vec3_1 );

    		_tmp_vec3_1.x = abs.e01;
    		_tmp_vec3_1.y = abs.e11;
    		_tmp_vec3_1.z = abs.e21;
    		extents.y = local_half_extents.dot( _tmp_vec3_1 );

    		_tmp_vec3_1.x = abs.e02;
    		_tmp_vec3_1.y = abs.e12;
    		_tmp_vec3_1.z = abs.e22;
    		extents.z = local_half_extents.dot( _tmp_vec3_1 );

    		this.min.subtractVectors( center, extents );
    		this.max.addVectors( center, extents );
    	};
    })();

    Goblin.AABB.prototype.intersects = function( aabb ) {
        if (
            this.max.x < aabb.min.x ||
            this.max.y < aabb.min.y ||
            this.max.z < aabb.min.z ||
            this.min.x > aabb.max.x ||
            this.min.y > aabb.max.y ||
            this.min.z > aabb.max.z
        )
        {
            return false;
        }

        return true;
    };

    /**
     * Checks if a ray segment intersects with this AABB
     *
     * @method testRayIntersect
     * @property start {vec3} start point of the segment
     * @property end {vec3{ end point of the segment
     * @return {boolean}
     */
    Goblin.AABB.prototype.testRayIntersect = (function(){
    	var direction = new Goblin.Vector3(),
    		tmin, tmax,
    		ood, t1, t2;

    	return function AABB_testRayIntersect( start, end ) {
    		tmin = 0;

    		direction.subtractVectors( end, start );
    		tmax = direction.length();
    		direction.scale( 1 / tmax ); // normalize direction

    		var extent_min, extent_max;

            // Check X axis
            extent_min = this.min.x;
            extent_max = this.max.x;
            if ( Math.abs( direction.x ) < Goblin.EPSILON ) {
                // Ray is parallel to axis
                if ( start.x < extent_min || start.x > extent_max ) {
                    return false;
                }
            } else {
                ood = 1 / direction.x;
                t1 = ( extent_min - start.x ) * ood;
                t2 = ( extent_max - start.x ) * ood;
                if ( t1 > t2 ) {
                    ood = t1; // ood is a convenient temp variable as it's not used again
                    t1 = t2;
                    t2 = ood;
                }

                // Find intersection intervals
                tmin = Math.max( tmin, t1 );
                tmax = Math.min( tmax, t2 );

                if ( tmin > tmax ) {
                    return false;
                }
            }

            // Check Y axis
            extent_min = this.min.y;
            extent_max = this.max.y;
            if ( Math.abs( direction.y ) < Goblin.EPSILON ) {
                // Ray is parallel to axis
                if ( start.y < extent_min || start.y > extent_max ) {
                    return false;
                }
            } else {
                ood = 1 / direction.y;
                t1 = ( extent_min - start.y ) * ood;
                t2 = ( extent_max - start.y ) * ood;
                if ( t1 > t2 ) {
                    ood = t1; // ood is a convenient temp variable as it's not used again
                    t1 = t2;
                    t2 = ood;
                }

                // Find intersection intervals
                tmin = Math.max( tmin, t1 );
                tmax = Math.min( tmax, t2 );

                if ( tmin > tmax ) {
                    return false;
                }
            }

            // Check Z axis
            extent_min = this.min.z;
            extent_max = this.max.z;
            if ( Math.abs( direction.z ) < Goblin.EPSILON ) {
                // Ray is parallel to axis
                if ( start.z < extent_min || start.z > extent_max ) {
                    return false;
                }
            } else {
                ood = 1 / direction.z;
                t1 = ( extent_min - start.z ) * ood;
                t2 = ( extent_max - start.z ) * ood;
                if ( t1 > t2 ) {
                    ood = t1; // ood is a convenient temp variable as it's not used again
                    t1 = t2;
                    t2 = ood;
                }

                // Find intersection intervals
                tmin = Math.max( tmin, t1 );
                tmax = Math.min( tmax, t2 );

                if ( tmin > tmax ) {
                    return false;
                }
            }

    		return true;
    	};
    })();
    (function(){
    	function getSurfaceArea( aabb ) {
    		var x = aabb.max.x - aabb.min.x,
    			y = aabb.max.y - aabb.min.y,
    			z = aabb.max.z - aabb.min.z;
    		return x * ( y + z ) + y * z;
    	}

    	/**
    	 * Tree node for a BVH
    	 *
    	 * @class BVHNode
    	 * @param [object] {Object} leaf object in the BVH tree
    	 * @constructor
    	 * @private
    	 */
    	var BVHNode = function( object ) {
    		this.aabb = new Goblin.AABB();
    		this.area = 0;

    		this.parent = null;
    		this.left = null;
    		this.right = null;

    		this.morton = null;

    		this.object = object || null;
    	};
    	BVHNode.prototype = {
    		isLeaf: function() {
    			return this.object != null;
    		},

    		computeBounds: function( global_aabb ) {
    			if ( this.isLeaf() ) {
    				this.aabb.copy( this.object.aabb );
    			} else {
    				this.aabb.combineAABBs( this.left.aabb, this.right.aabb );
    			}

    			this.area = getSurfaceArea( this.aabb );
    		},

    		valueOf: function() {
    			return this.area;
    		}
    	};

    	/**
    	 * Bottom-up BVH construction based on "Efficient BVH Construction via Approximate Agglomerative Clustering", Yan Gu 2013
    	 *
    	 * @Class AAC
    	 * @static
    	 * @private
    	 */
    	var AAC = (function(){
    		function part1By2( n ) {
    			n = ( n ^ ( n << 16 ) ) & 0xff0000ff;
    			n = ( n ^ ( n << 8 ) ) & 0x0300f00f;
    			n = ( n ^ ( n << 4 ) ) & 0x030c30c3;
    			n = ( n ^ ( n << 2 ) ) & 0x09249249;
    			return n;
    		}
    		function morton( x, y, z ) {
    			return ( part1By2( z ) << 2 ) + ( part1By2( y ) << 1 ) + part1By2( x );
    		}

    		var _tmp_aabb = new Goblin.AABB();

    		var AAC = function( global_aabb, leaves ) {
    			var global_width = global_aabb.max.x - global_aabb.min.x,
    				global_height = global_aabb.max.y - global_aabb.min.y,
    				global_depth = global_aabb.max.z - global_aabb.min.z,
    				max_value = 1 << 9,
    				scale_x = max_value / global_width,
    				scale_y = max_value / global_height,
    				scale_z = max_value / global_depth;

    			// Compute the morton code for each leaf
    			for ( var i = 0; i < leaves.length; i++ ) {
    				var leaf = leaves[i],
    					// find center of aabb
    					x = ( leaf.aabb.max.x - leaf.aabb.min.x ) / 2 + leaf.aabb.min.x,
    					y = ( leaf.aabb.max.y - leaf.aabb.min.y ) / 2 + leaf.aabb.min.y,
    					z = ( leaf.aabb.max.z - leaf.aabb.min.z ) / 2 + leaf.aabb.min.z;

    				leaf.morton = morton(
    					( x + global_aabb.min.x ) * scale_x,
    					( y + global_aabb.min.y ) * scale_y,
    					( z + global_aabb.min.z ) * scale_z
    				);
    			}

    			// Sort leaves based on morton code
    			leaves.sort( AAC.mortonSort );
    			var tree = AAC.buildTree( leaves, 29 ); // @TODO smaller starting bit, log4N or log2N or log10N ?
    			//var tree = AAC.buildTree( leaves, 20 ); // @TODO smaller starting bit, log4N or log2N or log10N ?
    			AAC.combineCluster( tree, 1 );
    			return tree;
    		};
    		AAC.mortonSort = function( a, b ) {
    			if ( a.morton < b.morton ) {
    				return -1;
    			} else if ( a.morton > b.morton ) {
    				return 1;
    			} else {
    				return 0;
    			}
    		};
    		AAC.clusterReductionCount = function( cluster_size ) {
    			var c = Math.pow( cluster_size, 0.5 ) / 2,
    				a = 0.5;
    			return Math.max( c * Math.pow( cluster_size, a ), 1 );
    		};
    		AAC.buildTree = function( nodes, bit ) {
    			var cluster = [];

    			if ( nodes.length < AAC.max_bucket_size ) {
    				cluster.push.apply( cluster, nodes );
    				AAC.combineCluster( cluster, AAC.clusterReductionCount( AAC.max_bucket_size ) );
    			} else {
    				var left = [],
    					right = [];

    				if ( bit < 1 ) {
    					// no more bits, just cut bucket in half
    					left = nodes.slice( 0, nodes.length / 2 );
    					right = nodes.slice( nodes.length / 2 );
    				} else {
    					var bit_value = 1 << bit;
    					for ( var i = 0; i < nodes.length; i++ ) {
    						var node = nodes[i];
    						if ( node.morton & bit_value ) {
    							right.push( node );
    						} else {
    							left.push( node );
    						}
    					}
    				}
    				cluster.push.apply( cluster, AAC.buildTree( left, bit - 1 ) );
    				cluster.push.apply( cluster, AAC.buildTree( right, bit - 1 ) );
    				AAC.combineCluster( cluster, AAC.clusterReductionCount( cluster.length ) );
    			}

    			return cluster;
    		};
    		AAC.combineCluster = function( cluster, max_clusters ) {
    			if ( cluster.length <= 1 ) {
    				return cluster;
    			}

    			// find the best match for each object
    			var merge_queue = new Goblin.MinHeap(),
    				merged_node;
    			for ( var i = 0; i < cluster.length; i++ ) {
    				merged_node = new BVHNode();
    				merged_node.left = cluster[i];
    				merged_node.right = AAC.findBestMatch( cluster, cluster[i] );
    				merged_node.computeBounds();
    				merge_queue.push( merged_node );
    			}

    			var best_cluster;
    			while( cluster.length > max_clusters ) {
    				best_cluster = merge_queue.pop();
    				cluster.splice( cluster.indexOf( best_cluster.left ), 1 );
    				cluster.splice( cluster.indexOf( best_cluster.right ), 1 );
    				cluster.push( best_cluster );

    				// update the merge queue
    				// @TODO don't clear the whole heap every time, only need to update any nodes which touched best_cluster.left / best_cluster.right
    				merge_queue.heap.length = 0;
    				for ( i = 0; i < cluster.length; i++ ) {
    					merged_node = new BVHNode();
    					merged_node.left = cluster[i];
    					merged_node.right = AAC.findBestMatch( cluster, cluster[i] );
    					merged_node.computeBounds();
    					merge_queue.push( merged_node );
    				}
    			}
    		};
    		AAC.findBestMatch = function( cluster, object ) {
    			var area,
    				best_area = Infinity,
    				best_idx = 0;
    			for ( var i = 0; i < cluster.length; i++ ) {
    				if ( cluster[i] === object ) {
    					continue;
    				}
    				_tmp_aabb.combineAABBs( object.aabb, cluster[i].aabb );
    				area = getSurfaceArea( _tmp_aabb );

    				if ( area < best_area ) {
    					best_area = area;
    					best_idx = i;
    				}
    			}

    			return cluster[best_idx];
    		};
    		AAC.max_bucket_size = 20;
    		return AAC;
    	})();

    	/**
    	 * Creates a bounding volume hierarchy around a group of objects which have AABBs
    	 *
    	 * @class BVH
    	 * @param bounded_objects {Array} group of objects to be hierarchized
    	 * @constructor
    	 */
    	Goblin.BVH = function( bounded_objects ) {
    		// Create a node for each object
    		var leaves = [],
    			global_aabb = new Goblin.AABB();

    		for ( var i = 0; i < bounded_objects.length; i++ ) {
    			global_aabb.combineAABBs( global_aabb, bounded_objects[i].aabb );
    			var leaf = new BVHNode( bounded_objects[i] );
    			leaf.computeBounds();
    			leaves.push( leaf );
    		}

    		this.tree = AAC( global_aabb, leaves )[0];
    	};

    	Goblin.BVH.AAC = AAC;
    })();
    /**
     * Structure which holds information about a contact between two objects
     *
     * @Class ContactDetails
     * @constructor
     */
    Goblin.ContactDetails = function() {
    	this.uid = Goblin.Utility.getUid();

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
    	this.contact_point = new Goblin.Vector3();

    	/**
    	 * contact point in local frame of `object_a`
    	 *
    	 * @property contact_point_in_a
    	 * @type {vec3}
    	 */
    	this.contact_point_in_a = new Goblin.Vector3();

    	/**
    	 * contact point in local frame of `object_b`
    	 *
    	 * @property contact_point_in_b
    	 * @type {vec3}
    	 */
    	this.contact_point_in_b = new Goblin.Vector3();

    	/**
    	 * normal vector, in world coordinates, of the contact
    	 *
    	 * @property contact_normal
    	 * @type {vec3}
    	 */
    	this.contact_normal = new Goblin.Vector3();

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

    	this.listeners = {};
    };
    Goblin.EventEmitter.apply( Goblin.ContactDetails );

    Goblin.ContactDetails.prototype.destroy = function() {
    	this.emit( 'destroy' );
    	Goblin.ObjectPool.freeObject( 'ContactDetails', this );
    };
    /**
     * Structure which holds information about the contact points between two objects
     *
     * @Class ContactManifold
     * @constructor
     */
    Goblin.ContactManifold = function() {
    	/**
    	 * first body in the contact
    	 *
    	 * @property object_a
    	 * @type {RigidBody}
    	 */
    	this.object_a = null;

    	/**
    	 * second body in the contact
    	 *
    	 * @property object_b
    	 * @type {RigidBody}
    	 */
    	this.object_b = null;

    	/**
    	 * array of the active contact points for this manifold
    	 *
    	 * @property points
    	 * @type {Array}
    	 */
    	this.points = [];

    	/**
    	 * reference to the next `ContactManifold` in the list
    	 *
    	 * @property next_manifold
    	 * @type {ContactManifold}
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
    		_tmp_vec3_1.subtractVectors( new_contact.contact_point_in_a, this.points[1].contact_point_in_a );
    		_tmp_vec3_2.subtractVectors( this.points[3].contact_point_in_a, this.points[2].contact_point_in_a );
    		_tmp_vec3_1.cross( _tmp_vec3_2 );
    		res0 = _tmp_vec3_1.lengthSquared();
    	}
    	if ( max_penetration_index !== 1 ) {
    		_tmp_vec3_1.subtractVectors( new_contact.contact_point_in_a, this.points[0].contact_point_in_a );
    		_tmp_vec3_2.subtractVectors( this.points[3].contact_point_in_a, this.points[2].contact_point_in_a );
    		_tmp_vec3_1.cross( _tmp_vec3_2 );
    		res1 = _tmp_vec3_1.lengthSquared();
    	}
    	if ( max_penetration_index !== 2 ) {
    		_tmp_vec3_1.subtractVectors( new_contact.contact_point_in_a, this.points[0].contact_point_in_a );
    		_tmp_vec3_2.subtractVectors( this.points[3].contact_point_in_a, this.points[1].contact_point_in_a );
    		_tmp_vec3_1.cross( _tmp_vec3_2 );
    		res2 = _tmp_vec3_1.lengthSquared();
    	}
    	if ( max_penetration_index !== 3 ) {
    		_tmp_vec3_1.subtractVectors( new_contact.contact_point_in_a, this.points[0].contact_point_in_a );
    		_tmp_vec3_2.subtractVectors( this.points[2].contact_point_in_a, this.points[1].contact_point_in_a );
    		_tmp_vec3_1.cross( _tmp_vec3_2 );
    		res3 = _tmp_vec3_1.lengthSquared();
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

    /**
     * Adds a contact point to the manifold
     *
     * @param {Goblin.ContactDetails} contact
     */
    Goblin.ContactManifold.prototype.addContact = function( contact ) {
    	//@TODO add feature-ids to detect duplicate contacts
    	var i;
    	for ( i = 0; i < this.points.length; i++ ) {
    		if ( this.points[i].contact_point.distanceTo( contact.contact_point ) <= 0.02 ) {
    			contact.destroy();
    			return;
    		}
    	}

    	var use_contact = false;
    	if ( contact != null ) {
    		use_contact = contact.object_a.emit( 'speculativeContact', contact.object_b, contact );
    		if ( use_contact !== false ) {
    			use_contact = contact.object_b.emit( 'speculativeContact', contact.object_a, contact );
    		}

    		if ( use_contact === false ) {
    			contact.destroy();
    			return;
    		} else {
    			contact.object_a.emit( 'contact', contact.object_b, contact );
    			contact.object_b.emit( 'contact', contact.object_a, contact );
    		}
    	}

    	// Add contact if we don't have enough points yet
    	if ( this.points.length < 4 ) {
    		this.points.push( contact );
    	} else {
    		var replace_index = this.findWeakestContact( contact );
    		this.points[replace_index].destroy();
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
    	var i,
    		j,
    		point,
    		object_a_world_coords = new Goblin.Vector3(),
    		object_b_world_coords = new Goblin.Vector3(),
    		vector_difference = new Goblin.Vector3(),
    		starting_points_length = this.points.length;

    	for ( i = 0; i < this.points.length; i++ ) {
    		point = this.points[i];

    		// Convert the local contact points into world coordinates
    		point.object_a.transform.transformVector3Into( point.contact_point_in_a, object_a_world_coords );
    		point.object_b.transform.transformVector3Into( point.contact_point_in_b, object_b_world_coords );

    		// Find new world contact point
    		point.contact_point.addVectors( object_a_world_coords, object_b_world_coords );
    		point.contact_point.scale( 0.5  );

    		// Find the new penetration depth
    		vector_difference.subtractVectors( object_a_world_coords, object_b_world_coords );
    		point.penetration_depth = vector_difference.dot( point.contact_normal );

    		// If distance from contact is too great remove this contact point
    		if ( point.penetration_depth < -0.02 ) {
    			// Points are too far away along the contact normal
    			point.destroy();
    			for ( j = i; j < this.points.length; j++ ) {
    				this.points[j] = this.points[j + 1];
    			}
    			this.points.length = this.points.length - 1;
    			this.object_a.emit( 'endContact', this.object_b );
    			this.object_b.emit( 'endContact', this.object_a );
    		} else {
    			// Check if points are too far away orthogonally
    			_tmp_vec3_1.scaleVector( point.contact_normal, point.penetration_depth );
    			_tmp_vec3_1.subtractVectors( object_a_world_coords, _tmp_vec3_1 );

    			_tmp_vec3_1.subtractVectors( object_b_world_coords, _tmp_vec3_1 );
    			var distance = _tmp_vec3_1.lengthSquared();
    			if ( distance > 0.2 * 0.2 ) {
    				// Points are indeed too far away
    				point.destroy();
    				for ( j = i; j < this.points.length; j++ ) {
    					this.points[j] = this.points[j + 1];
    				}
    				this.points.length = this.points.length - 1;
    				this.object_a.emit( 'endContact', this.object_b );
    				this.object_b.emit( 'endContact', this.object_a );
    			}
    		}
    	}

    	if (starting_points_length > 0 && this.points.length === 0) {
    		// this update removed all contact points
    		this.object_a.emit( 'endAllContact', this.object_b );
    		this.object_b.emit( 'endAllContact', this.object_a );
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
    	 * @type {ContactManifold}
    	 */
    	this.first = null;
    };

    /**
     * Inserts a ContactManifold into the list
     *
     * @method insert
     * @param {ContactManifold} contact_manifold contact manifold to insert into the list
     */
    Goblin.ContactManifoldList.prototype.insert = function( contact_manifold ) {
    	// The list is completely unordered, throw the manifold at the beginning
    	contact_manifold.next_manifold = this.first;
    	this.first = contact_manifold;
    };

    /**
     * Returns (and possibly creates) a ContactManifold for the two rigid bodies
     *
     * @param {RigidBody} object_a
     * @param {RigidBoxy} object_b
     * @returns {ContactManifold}
     */
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
    Goblin.GhostBody = function( shape ) {
        Goblin.RigidBody.call( this, shape, Infinity );

        this.contacts = [];
        this.tick_contacts = [];

        this.addListener( 'speculativeContact', Goblin.GhostBody.prototype.onSpeculativeContact );
    };

    Goblin.GhostBody.prototype = Object.create( Goblin.RigidBody.prototype );

    Goblin.GhostBody.prototype.onSpeculativeContact = function( object_b, contact ) {
        this.tick_contacts.push( object_b );
        if ( this.contacts.indexOf( object_b ) === -1 ) {
            this.contacts.push( object_b );
            this.emit( 'contactStart', object_b, contact );
            object_b.emit( 'contactStart', this, contact );
        } else {
            this.emit( 'contactContinue', object_b, contact );
            object_b.emit( 'contactContinue', this, contact );
        }

        return false;
    };

    Goblin.GhostBody.prototype.checkForEndedContacts = function() {
        for ( var i = 0; i < this.contacts.length; i++ ) {
            if ( this.tick_contacts.indexOf( this.contacts[i] ) === -1 ) {
                this.emit( 'contactEnd', this.contacts[i] );
                this.contacts.splice( i, 1 );
                i -= 1;
            }
        }
        this.tick_contacts.length = 0;
    };
    /**
     * Adapted from BulletPhysics's btIterativeSolver
     *
     * @class IterativeSolver
     * @constructor
     */
    Goblin.IterativeSolver = function() {
    	this.existing_contact_ids = {};

    	/**
    	 * Holds contact constraints generated from contact manifolds
    	 *
    	 * @property contact_constraints
    	 * @type {Array}
    	 */
    	this.contact_constraints = [];

    	/**
    	 * Holds friction constraints generated from contact manifolds
    	 *
    	 * @property friction_constraints
    	 * @type {Array}
    	 */
    	this.friction_constraints = [];

    	/**
    	 * array of all constraints being solved
    	 *
    	 * @property all_constraints
    	 * @type {Array}
    	 */
    	this.all_constraints = [];

    	/**
    	 * array of constraints on the system, excluding contact & friction
    	 *
    	 * @property constraints
    	 * @type {Array}
    	 */
    	this.constraints = [];

    	/**
    	 * maximum solver iterations per time step
    	 *
    	 * @property max_iterations
    	 * @type {number}
    	 */
    	this.max_iterations = 10;

    	/**
    	 * maximum solver iterations per time step to resolve contacts
    	 *
    	 * @property penetrations_max_iterations
    	 * @type {number}
    	 */
    	this.penetrations_max_iterations = 5;

    	/**
    	 * used to relax the contact position solver, 0 is no position correction and 1 is full correction
    	 *
    	 * @property relaxation
    	 * @type {number}
    	 * @default 0.9
    	 */
    	this.relaxation = 0.9;

    	/**
    	 * weighting used in the Gauss-Seidel successive over-relaxation solver
    	 *
    	 * @property sor_weight
    	 * @type {number}
    	 */
    	this.sor_weight = 0.85;

    	/**
    	 * how much of the solution to start with on the next solver pass
    	 *
    	 * @property warmstarting_factor
    	 * @type {number}
    	 */
    	this.warmstarting_factor = 0.95;


    	var solver = this;
    	/**
    	 * used to remove contact constraints from the system when their contacts are destroyed
    	 *
    	 * @method onContactDeactivate
    	 * @private
    	 */
    	this.onContactDeactivate = function() {
    		this.removeListener( 'deactivate', solver.onContactDeactivate );

    		var idx = solver.contact_constraints.indexOf( this );
    		solver.contact_constraints.splice( idx, 1 );

    		delete solver.existing_contact_ids[ this.contact.uid ];
    	};
    	/**
    	 * used to remove friction constraints from the system when their contacts are destroyed
    	 *
    	 * @method onFrictionDeactivate
    	 * @private
    	 */
    	this.onFrictionDeactivate = function() {
    		this.removeListener( 'deactivate', solver.onFrictionDeactivate );

    		var idx = solver.friction_constraints.indexOf( this );
    		solver.friction_constraints.splice( idx, 1 );
    	};
    };

    /**
     * adds a constraint to the solver
     *
     * @method addConstraint
     * @param constraint {Goblin.Constraint} constraint to be added
     */
    Goblin.IterativeSolver.prototype.addConstraint = function( constraint ) {
    	if ( this.constraints.indexOf( constraint ) === -1 ) {
    		this.constraints.push( constraint );
    	}
    };

    /**
     * removes a constraint from the solver
     *
     * @method removeConstraint
     * @param constraint {Goblin.Constraint} constraint to be removed
     */
    Goblin.IterativeSolver.prototype.removeConstraint = function( constraint ) {
    	var idx = this.constraints.indexOf( constraint );
    	if ( idx !== -1 ) {
    		this.constraints.splice( idx, 1 );
    	}
    };

    /**
     * Converts contact manifolds into contact constraints
     *
     * @method processContactManifolds
     * @param contact_manifolds {Array} contact manifolds to process
     */
    Goblin.IterativeSolver.prototype.processContactManifolds = function( contact_manifolds ) {
    	var i, j,
    		manifold,
    		contacts_length,
    		contact,
    		constraint;

    	manifold = contact_manifolds.first;

    	while( manifold ) {
    		contacts_length = manifold.points.length;

    		for ( i = 0; i < contacts_length; i++ ) {
    			contact = manifold.points[i];

    			var existing_constraint = this.existing_contact_ids.hasOwnProperty( contact.uid );

    			if ( !existing_constraint ) {
    				this.existing_contact_ids[contact.uid] = true;

    				// Build contact constraint
    				constraint = Goblin.ObjectPool.getObject( 'ContactConstraint' );
    				constraint.buildFromContact( contact );
    				this.contact_constraints.push( constraint );
    				constraint.addListener( 'deactivate', this.onContactDeactivate );

    				// Build friction constraint
    				constraint = Goblin.ObjectPool.getObject( 'FrictionConstraint' );
    				constraint.buildFromContact( contact );
    				this.friction_constraints.push( constraint );
    				constraint.addListener( 'deactivate', this.onFrictionDeactivate );
    			}
    		}

    		manifold = manifold.next_manifold;
    	}

    	// @TODO just for now
    	this.all_constraints.length = 0;
    	Array.prototype.push.apply( this.all_constraints, this.friction_constraints );
    	Array.prototype.push.apply( this.all_constraints, this.constraints );
    	Array.prototype.push.apply( this.all_constraints, this.contact_constraints );
    };

    Goblin.IterativeSolver.prototype.prepareConstraints = function( time_delta ) {
    	var num_constraints = this.all_constraints.length,
    		constraint,
    		row,
    		i, j;

    	for ( i = 0; i < num_constraints; i++ ) {
    		constraint = this.all_constraints[i];
    		if ( constraint.active === false ) {
    			continue;
    		}

    		constraint.update( time_delta );
    		for ( j = 0; j < constraint.rows.length; j++ ) {
    			row = constraint.rows[j];
    			row.multiplier = 0;
    			row.computeB( constraint ); // Objects' inverted mass & inertia tensors & Jacobian
    			row.computeD();
    			row.computeEta( constraint, time_delta ); // Amount of work needed for the constraint
    		}
    	}
    };

    Goblin.IterativeSolver.prototype.resolveContacts = function() {
    	var iteration,
    		constraint,
    		jdot, row, i,
    		delta_lambda,
    		max_impulse = 0,
    		invmass;

    	// Solve penetrations
    	for ( iteration = 0; iteration < this.penetrations_max_iterations; iteration++ ) {
    		max_impulse = 0;
    		for ( i = 0; i < this.contact_constraints.length; i++ ) {
    			constraint = this.contact_constraints[i];
    			row = constraint.rows[0];

    			jdot = 0;
    			if ( constraint.object_a != null && constraint.object_a._mass !== Infinity ) {
    				jdot += (
    					row.jacobian[0] * constraint.object_a.linear_factor.x * constraint.object_a.push_velocity.x +
    					row.jacobian[1] * constraint.object_a.linear_factor.y * constraint.object_a.push_velocity.y +
    					row.jacobian[2] * constraint.object_a.linear_factor.z * constraint.object_a.push_velocity.z +
    					row.jacobian[3] * constraint.object_a.angular_factor.x * constraint.object_a.turn_velocity.x +
    					row.jacobian[4] * constraint.object_a.angular_factor.y * constraint.object_a.turn_velocity.y +
    					row.jacobian[5] * constraint.object_a.angular_factor.z * constraint.object_a.turn_velocity.z
    				);
    			}
    			if ( constraint.object_b != null && constraint.object_b._mass !== Infinity ) {
    				jdot += (
    					row.jacobian[6] * constraint.object_b.linear_factor.x * constraint.object_b.push_velocity.x +
    					row.jacobian[7] * constraint.object_b.linear_factor.y * constraint.object_b.push_velocity.y +
    					row.jacobian[8] * constraint.object_b.linear_factor.z * constraint.object_b.push_velocity.z +
    					row.jacobian[9] * constraint.object_b.angular_factor.x * constraint.object_b.turn_velocity.x +
    					row.jacobian[10] * constraint.object_b.angular_factor.y * constraint.object_b.turn_velocity.y +
    					row.jacobian[11] * constraint.object_b.angular_factor.z * constraint.object_b.turn_velocity.z
    				);
    			}

    			delta_lambda = ( constraint.contact.penetration_depth - jdot ) / row.D || 0;
    			var cache = row.multiplier;
    			row.multiplier = Math.max(
    				row.lower_limit,
    				Math.min(
    					cache + delta_lambda,
    					row.upper_limit
    				)
    			);
    			delta_lambda = row.multiplier - cache;
    			max_impulse = Math.max( max_impulse, delta_lambda );

    			if ( constraint.object_a && constraint.object_a._mass !== Infinity ) {
    				constraint.object_a.push_velocity.x += delta_lambda * row.B[0];
    				constraint.object_a.push_velocity.y += delta_lambda * row.B[1];
    				constraint.object_a.push_velocity.z += delta_lambda * row.B[2];

    				constraint.object_a.turn_velocity.x += delta_lambda * row.B[3];
    				constraint.object_a.turn_velocity.y += delta_lambda * row.B[4];
    				constraint.object_a.turn_velocity.z += delta_lambda * row.B[5];
    			}
    			if ( constraint.object_b && constraint.object_b._mass !== Infinity ) {
    				constraint.object_b.push_velocity.x += delta_lambda * row.B[6];
    				constraint.object_b.push_velocity.y += delta_lambda * row.B[7];
    				constraint.object_b.push_velocity.z += delta_lambda * row.B[8];

    				constraint.object_b.turn_velocity.x += delta_lambda * row.B[9];
    				constraint.object_b.turn_velocity.y += delta_lambda * row.B[10];
    				constraint.object_b.turn_velocity.z += delta_lambda * row.B[11];
    			}
    		}

    		if ( max_impulse >= -Goblin.EPSILON && max_impulse <= Goblin.EPSILON ) {
    			break;
    		}
    	}

    	// Apply position/rotation solver
    	for ( i = 0; i < this.contact_constraints.length; i++ ) {
    		constraint = this.contact_constraints[i];
    		row = constraint.rows[0];

    		if ( constraint.object_a != null && constraint.object_a._mass !== Infinity ) {
    			invmass = constraint.object_a._mass_inverted;
    			constraint.object_a.position.x += invmass * row.jacobian[0] * constraint.object_a.linear_factor.x * row.multiplier * this.relaxation;
    			constraint.object_a.position.y += invmass * row.jacobian[1] * constraint.object_a.linear_factor.y * row.multiplier * this.relaxation;
    			constraint.object_a.position.z += invmass * row.jacobian[2] * constraint.object_a.linear_factor.z * row.multiplier * this.relaxation;

    			_tmp_vec3_1.x = row.jacobian[3] * constraint.object_a.angular_factor.x * row.multiplier * this.relaxation;
    			_tmp_vec3_1.y = row.jacobian[4] * constraint.object_a.angular_factor.y * row.multiplier * this.relaxation;
    			_tmp_vec3_1.z = row.jacobian[5] * constraint.object_a.angular_factor.z * row.multiplier * this.relaxation;
    			constraint.object_a.inverseInertiaTensorWorldFrame.transformVector3( _tmp_vec3_1 );

    			_tmp_quat4_1.x = _tmp_vec3_1.x;
    			_tmp_quat4_1.y = _tmp_vec3_1.y;
    			_tmp_quat4_1.z = _tmp_vec3_1.z;
    			_tmp_quat4_1.w = 0;
    			_tmp_quat4_1.multiply( constraint.object_a.rotation );

    			constraint.object_a.rotation.x += 0.5 * _tmp_quat4_1.x;
    			constraint.object_a.rotation.y += 0.5 * _tmp_quat4_1.y;
    			constraint.object_a.rotation.z += 0.5 * _tmp_quat4_1.z;
    			constraint.object_a.rotation.w += 0.5 * _tmp_quat4_1.w;
    			constraint.object_a.rotation.normalize();
    		}

    		if ( constraint.object_b != null && constraint.object_b._mass !== Infinity ) {
    			invmass = constraint.object_b._mass_inverted;
    			constraint.object_b.position.x += invmass * row.jacobian[6] * constraint.object_b.linear_factor.x * row.multiplier * this.relaxation;
    			constraint.object_b.position.y += invmass * row.jacobian[7] * constraint.object_b.linear_factor.y * row.multiplier * this.relaxation;
    			constraint.object_b.position.z += invmass * row.jacobian[8] * constraint.object_b.linear_factor.z * row.multiplier * this.relaxation;

    			_tmp_vec3_1.x = row.jacobian[9] * constraint.object_b.angular_factor.x * row.multiplier * this.relaxation;
    			_tmp_vec3_1.y = row.jacobian[10] * constraint.object_b.angular_factor.y * row.multiplier * this.relaxation;
    			_tmp_vec3_1.z = row.jacobian[11] * constraint.object_b.angular_factor.z * row.multiplier * this.relaxation;
    			constraint.object_b.inverseInertiaTensorWorldFrame.transformVector3( _tmp_vec3_1 );

    			_tmp_quat4_1.x = _tmp_vec3_1.x;
    			_tmp_quat4_1.y = _tmp_vec3_1.y;
    			_tmp_quat4_1.z = _tmp_vec3_1.z;
    			_tmp_quat4_1.w = 0;
    			_tmp_quat4_1.multiply( constraint.object_b.rotation );

    			constraint.object_b.rotation.x += 0.5 * _tmp_quat4_1.x;
    			constraint.object_b.rotation.y += 0.5 * _tmp_quat4_1.y;
    			constraint.object_b.rotation.z += 0.5 * _tmp_quat4_1.z;
    			constraint.object_b.rotation.w += 0.5 * _tmp_quat4_1.w;
    			constraint.object_b.rotation.normalize();
    		}

    		row.multiplier = 0;
    	}
    };

    Goblin.IterativeSolver.prototype.solveConstraints = function() {
    	var num_constraints = this.all_constraints.length,
    		constraint,
    		num_rows,
    		row,
    		warmth,
    		i, j;

    	var iteration,
    		delta_lambda,
    		max_impulse = 0, // Track the largest impulse per iteration; if the impulse is <= EPSILON then early out
    		jdot;

    	// Warm starting
    	for ( i = 0; i < num_constraints; i++ ) {
    		constraint = this.all_constraints[i];
    		if ( constraint.active === false ) {
    			continue;
    		}

    		for ( j = 0; j < constraint.rows.length; j++ ) {
    			row = constraint.rows[j];
    			warmth = row.multiplier_cached * this.warmstarting_factor;
    			row.multiplier = warmth;

    			if ( constraint.object_a && constraint.object_a._mass !== Infinity ) {
    				constraint.object_a.solver_impulse[0] += warmth * row.B[0];
    				constraint.object_a.solver_impulse[1] += warmth * row.B[1];
    				constraint.object_a.solver_impulse[2] += warmth * row.B[2];

    				constraint.object_a.solver_impulse[3] += warmth * row.B[3];
    				constraint.object_a.solver_impulse[4] += warmth * row.B[4];
    				constraint.object_a.solver_impulse[5] += warmth * row.B[5];
    			}
    			if ( constraint.object_b && constraint.object_b._mass !== Infinity ) {
    				constraint.object_b.solver_impulse[0] += warmth * row.B[6];
    				constraint.object_b.solver_impulse[1] += warmth * row.B[7];
    				constraint.object_b.solver_impulse[2] += warmth * row.B[8];

    				constraint.object_b.solver_impulse[3] += warmth * row.B[9];
    				constraint.object_b.solver_impulse[4] += warmth * row.B[10];
    				constraint.object_b.solver_impulse[5] += warmth * row.B[11];
    			}
    		}
    	}

    	for ( iteration = 0; iteration < this.max_iterations; iteration++ ) {
    		max_impulse = 0;
    		for ( i = 0; i < num_constraints; i++ ) {
    			constraint = this.all_constraints[i];
    			if ( constraint.active === false ) {
    				continue;
    			}
    			num_rows = constraint.rows.length;

    			for ( j = 0; j < num_rows; j++ ) {
    				row = constraint.rows[j];

    				jdot = 0;
    				if ( constraint.object_a != null && constraint.object_a._mass !== Infinity ) {
    					jdot += (
    						row.jacobian[0] * constraint.object_a.linear_factor.x * constraint.object_a.solver_impulse[0] +
    						row.jacobian[1] * constraint.object_a.linear_factor.y * constraint.object_a.solver_impulse[1] +
    						row.jacobian[2] * constraint.object_a.linear_factor.z * constraint.object_a.solver_impulse[2] +
    						row.jacobian[3] * constraint.object_a.angular_factor.x * constraint.object_a.solver_impulse[3] +
    						row.jacobian[4] * constraint.object_a.angular_factor.y * constraint.object_a.solver_impulse[4] +
    						row.jacobian[5] * constraint.object_a.angular_factor.z * constraint.object_a.solver_impulse[5]
    						);
    				}
    				if ( constraint.object_b != null && constraint.object_b._mass !== Infinity ) {
    					jdot += (
    						row.jacobian[6] * constraint.object_b.linear_factor.x * constraint.object_b.solver_impulse[0] +
    						row.jacobian[7] * constraint.object_b.linear_factor.y * constraint.object_b.solver_impulse[1] +
    						row.jacobian[8] * constraint.object_b.linear_factor.z * constraint.object_b.solver_impulse[2] +
    						row.jacobian[9] * constraint.object_b.angular_factor.x * constraint.object_b.solver_impulse[3] +
    						row.jacobian[10] * constraint.object_b.angular_factor.y * constraint.object_b.solver_impulse[4] +
    						row.jacobian[11] * constraint.object_b.angular_factor.z * constraint.object_b.solver_impulse[5]
    					);
    				}

    				delta_lambda = ( ( row.eta - jdot ) / row.D || 0) * constraint.factor;
    				var cache = row.multiplier,
    					multiplier_target = cache + delta_lambda;


    				// successive over-relaxation
    				multiplier_target = this.sor_weight * multiplier_target + ( 1 - this.sor_weight ) * cache;

    				// Clamp to row constraints
    				row.multiplier = Math.max(
    					row.lower_limit,
    					Math.min(
    						multiplier_target,
    						row.upper_limit
    					)
    				);

    				// Find final `delta_lambda`
    				delta_lambda = row.multiplier - cache;

    				var total_mass = ( constraint.object_a && constraint.object_a._mass !== Infinity ? constraint.object_a._mass : 0 ) +
    					( constraint.object_b && constraint.object_b._mass !== Infinity ? constraint.object_b._mass : 0 );
    				max_impulse = Math.max( max_impulse, Math.abs( delta_lambda ) / total_mass );

    				if ( constraint.object_a && constraint.object_a._mass !== Infinity ) {
    					constraint.object_a.solver_impulse[0] += delta_lambda * row.B[0];
    					constraint.object_a.solver_impulse[1] += delta_lambda * row.B[1];
    					constraint.object_a.solver_impulse[2] += delta_lambda * row.B[2];

    					constraint.object_a.solver_impulse[3] += delta_lambda * row.B[3];
    					constraint.object_a.solver_impulse[4] += delta_lambda * row.B[4];
    					constraint.object_a.solver_impulse[5] += delta_lambda * row.B[5];
    				}
    				if ( constraint.object_b && constraint.object_b._mass !== Infinity ) {
    					constraint.object_b.solver_impulse[0] += delta_lambda * row.B[6];
    					constraint.object_b.solver_impulse[1] += delta_lambda * row.B[7];
    					constraint.object_b.solver_impulse[2] += delta_lambda * row.B[8];

    					constraint.object_b.solver_impulse[3] += delta_lambda * row.B[9];
    					constraint.object_b.solver_impulse[4] += delta_lambda * row.B[10];
    					constraint.object_b.solver_impulse[5] += delta_lambda * row.B[11];
    				}
    			}
    		}

    		if ( max_impulse <= 0.1 ) {
    			break;
    		}
    	}
    };

    Goblin.IterativeSolver.prototype.applyConstraints = function( time_delta ) {
    	var num_constraints = this.all_constraints.length,
    		constraint,
    		num_rows,
    		row,
    		i, j,
    		invmass;

    	for ( i = 0; i < num_constraints; i++ ) {
    		constraint = this.all_constraints[i];
    		if ( constraint.active === false ) {
    			continue;
    		}
    		num_rows = constraint.rows.length;

    		constraint.last_impulse.x = constraint.last_impulse.y = constraint.last_impulse.z = 0;

    		for ( j = 0; j < num_rows; j++ ) {
    			row = constraint.rows[j];
    			row.multiplier_cached = row.multiplier;

    			if ( constraint.object_a != null && constraint.object_a._mass !== Infinity ) {
    				invmass = constraint.object_a._mass_inverted;
    				_tmp_vec3_2.x = invmass * time_delta * row.jacobian[0] * constraint.object_a.linear_factor.x * row.multiplier;
    				_tmp_vec3_2.y = invmass * time_delta * row.jacobian[1] * constraint.object_a.linear_factor.y * row.multiplier;
    				_tmp_vec3_2.z = invmass * time_delta * row.jacobian[2] * constraint.object_a.linear_factor.z * row.multiplier;
    				constraint.object_a.linear_velocity.add( _tmp_vec3_2 );
    				constraint.last_impulse.add( _tmp_vec3_2 );

    				_tmp_vec3_1.x = time_delta * row.jacobian[3] * constraint.object_a.angular_factor.x * row.multiplier;
    				_tmp_vec3_1.y = time_delta * row.jacobian[4] * constraint.object_a.angular_factor.y * row.multiplier;
    				_tmp_vec3_1.z = time_delta * row.jacobian[5] * constraint.object_a.angular_factor.z * row.multiplier;
    				constraint.object_a.inverseInertiaTensorWorldFrame.transformVector3( _tmp_vec3_1 );
    				constraint.object_a.angular_velocity.add( _tmp_vec3_1 );
    				constraint.last_impulse.add( _tmp_vec3_1 );
    			}

    			if ( constraint.object_b != null && constraint.object_b._mass !== Infinity ) {
    				invmass = constraint.object_b._mass_inverted;
    				_tmp_vec3_2.x = invmass * time_delta * row.jacobian[6] * constraint.object_b.linear_factor.x * row.multiplier;
    				_tmp_vec3_2.y = invmass * time_delta * row.jacobian[7] * constraint.object_b.linear_factor.y * row.multiplier;
    				_tmp_vec3_2.z = invmass * time_delta * row.jacobian[8] * constraint.object_b.linear_factor.z * row.multiplier;
    				constraint.object_b.linear_velocity.add(_tmp_vec3_2 );
    				constraint.last_impulse.add( _tmp_vec3_2 );

    				_tmp_vec3_1.x = time_delta * row.jacobian[9] * constraint.object_b.angular_factor.x * row.multiplier;
    				_tmp_vec3_1.y = time_delta * row.jacobian[10] * constraint.object_b.angular_factor.y * row.multiplier;
    				_tmp_vec3_1.z = time_delta * row.jacobian[11] * constraint.object_b.angular_factor.z * row.multiplier;
    				constraint.object_b.inverseInertiaTensorWorldFrame.transformVector3( _tmp_vec3_1 );
    				constraint.object_b.angular_velocity.add( _tmp_vec3_1 );
    				constraint.last_impulse.add( _tmp_vec3_1 );
    			}
    		}

    		if ( constraint.breaking_threshold > 0 ) {
    			if ( constraint.last_impulse.lengthSquared() >= constraint.breaking_threshold * constraint.breaking_threshold ) {
    				constraint.active = false;
    			}
    		}
    	}
    };
    /**
     * Takes possible contacts found by a broad phase and determines if they are legitimate contacts
     *
     * @class NarrowPhase
     * @constructor
     */
    Goblin.NarrowPhase = function() {
    	/**
    	 * holds all contacts which currently exist in the scene
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
    Goblin.NarrowPhase.prototype.updateContactManifolds = function() {
    	var current = this.contact_manifolds.first,
    		prev = null;

    	while ( current !== null ) {
    		current.update();

    		if ( current.points.length === 0 ) {
    			Goblin.ObjectPool.freeObject( 'ContactManifold', current );
    			if ( prev == null ) {
    				this.contact_manifolds.first = current.next_manifold;
    			} else {
    				prev.next_manifold = current.next_manifold;
    			}
    			current = current.next_manifold;
    		} else {
    			prev = current;
    			current = current.next_manifold;
    		}
    	}
    };

    Goblin.NarrowPhase.prototype.midPhase = function( object_a, object_b ) {
    	var compound,
    		other;

    	if ( object_a.shape instanceof Goblin.CompoundShape ) {
    		compound = object_a;
    		other = object_b;
    	} else {
    		compound = object_b;
    		other = object_a;
    	}

    	var proxy = Goblin.ObjectPool.getObject( 'RigidBodyProxy' ),
    		child_shape, contact;
    	for ( var i = 0; i < compound.shape.child_shapes.length; i++ ) {
    		child_shape = compound.shape.child_shapes[i];
    		proxy.setFrom( compound, child_shape );

    		if ( proxy.shape instanceof Goblin.CompoundShape || other.shape instanceof Goblin.CompoundShape ) {
    			this.midPhase( proxy, other );
    		} else {
    			contact = this.getContact( proxy, other );
    			if ( contact != null ) {
    				var parent_a, parent_b;
    				if ( contact.object_a === proxy ) {
    					contact.object_a = compound;
    					parent_a = proxy;
    					parent_b = other;
    				} else {
    					contact.object_b = compound;
    					parent_a = other;
    					parent_b = proxy;
    				}

    				if ( parent_a instanceof Goblin.RigidBodyProxy ) {
    					while ( parent_a.parent ) {
    						if ( parent_a instanceof Goblin.RigidBodyProxy ) {
    							parent_a.shape_data.transform.transformVector3( contact.contact_point_in_a );
    						}
    						parent_a = parent_a.parent;
    					}
    				}

    				if ( parent_b instanceof Goblin.RigidBodyProxy ) {
    					while ( parent_b.parent ) {
    						if ( parent_b instanceof Goblin.RigidBodyProxy ) {
    							parent_b.shape_data.transform.transformVector3( contact.contact_point_in_b );
    						}
    						parent_b = parent_b.parent;
    					}
    				}

    				contact.object_a = parent_a;
    				contact.object_b = parent_b;
    				this.addContact( parent_a, parent_b, contact );
    			}
    		}
    	}
    	Goblin.ObjectPool.freeObject( 'RigidBodyProxy', proxy );
    };

    Goblin.NarrowPhase.prototype.meshCollision = (function(){
    	var b_to_a = new Goblin.Matrix4(),
    		tri_b = new Goblin.TriangleShape( new Goblin.Vector3(), new Goblin.Vector3(), new Goblin.Vector3() ),
    		b_aabb = new Goblin.AABB(),
    		b_right_aabb = new Goblin.AABB(),
    		b_left_aabb = new Goblin.AABB();

    	function meshMesh( object_a, object_b, addContact ) {
    		// get matrix which converts from object_b's space to object_a
    		b_to_a.copy( object_a.transform_inverse );
    		b_to_a.multiply( object_b.transform );

    		// traverse both objects' AABBs while they overlap, if two overlapping leaves are found then perform Triangle/Triangle intersection test
    		var nodes = [ object_a.shape.hierarchy, object_b.shape.hierarchy ];
    		//debugger;
    		while ( nodes.length ) {
    			var a_node = nodes.shift(),
    				b_node = nodes.shift();

    			if ( a_node.isLeaf() && b_node.isLeaf() ) {
    				// Both sides are triangles, do intersection test
                    // convert node_b's triangle into node_a's frame
                    b_to_a.transformVector3Into( b_node.object.a, tri_b.a );
                    b_to_a.transformVector3Into( b_node.object.b, tri_b.b );
                    b_to_a.transformVector3Into( b_node.object.c, tri_b.c );
                    _tmp_vec3_1.subtractVectors( tri_b.b, tri_b.a );
                    _tmp_vec3_2.subtractVectors( tri_b.c, tri_b.a );
                    tri_b.normal.crossVectors( _tmp_vec3_1, _tmp_vec3_2 );
                    tri_b.normal.normalize();

    				var contact = Goblin.TriangleTriangle( a_node.object, tri_b );
                    if ( contact != null ) {
    					object_a.transform.rotateVector3( contact.contact_normal );

                        object_a.transform.transformVector3( contact.contact_point );

                        object_a.transform.transformVector3( contact.contact_point_in_b );
                        object_b.transform_inverse.transformVector3( contact.contact_point_in_b );

                        contact.object_a = object_a;
                        contact.object_b = object_b;

                        contact.restitution = ( object_a.restitution + object_b.restitution ) / 2;
                        contact.friction = ( object_a.friction + object_b.friction ) / 2;
                        /*console.log( contact );
                        debugger;*/

                        addContact( object_a, object_b, contact );
                    }
    			} else if ( a_node.isLeaf() ) {
    				// just a_node is a leaf
    				b_left_aabb.transform( b_node.left.aabb, b_to_a );
    				if ( a_node.aabb.intersects( b_left_aabb ) ) {
    					nodes.push( a_node, b_node.left );
    				}
    				b_right_aabb.transform( b_node.right.aabb, b_to_a );
    				if ( a_node.aabb.intersects( b_right_aabb ) ) {
    					nodes.push( a_node, b_node.right );
    				}
    			} else if ( b_node.isLeaf() ) {
    				// just b_node is a leaf
    				b_aabb.transform( b_node.aabb, b_to_a );
    				if ( b_aabb.intersects( a_node.left.aabb ) ) {
    					nodes.push( a_node.left, b_node );
    				}
    				if ( b_aabb.intersects( a_node.right.aabb ) ) {
    					nodes.push( a_node.right, b_node );
    				}
    			} else {
    				// neither node is a branch
    				b_left_aabb.transform( b_node.left.aabb, b_to_a );
    				b_right_aabb.transform( b_node.right.aabb, b_to_a );
    				if ( a_node.left.aabb.intersects( b_left_aabb ) ) {
    					nodes.push( a_node.left, b_node.left );
    				}
    				if ( a_node.left.aabb.intersects( b_right_aabb ) ) {
    					nodes.push( a_node.left, b_node.right );
    				}
    				if ( a_node.right.aabb.intersects( b_left_aabb ) ) {
    					nodes.push( a_node.right, b_node.left );
    				}
    				if ( a_node.right.aabb.intersects( b_right_aabb ) ) {
    					nodes.push( a_node.right, b_node.right );
    				}
    			}
    		}
    	}

    	function triangleConvex( triangle, mesh, convex ) {
    		// Create proxy to convert convex into mesh's space
    		var proxy = Goblin.ObjectPool.getObject( 'RigidBodyProxy' );

    		var child_shape = new Goblin.CompoundShapeChild( triangle, new Goblin.Vector3(), new Goblin.Quaternion() );
    		proxy.setFrom( mesh, child_shape );

    		var simplex = Goblin.GjkEpa.GJK( proxy, convex ),
    			contact;
    		if ( Goblin.GjkEpa.result != null ) {
    			contact = Goblin.GjkEpa.result;
    		} else if ( simplex != null ) {
    			contact = Goblin.GjkEpa.EPA( simplex );
    		}

    		Goblin.ObjectPool.freeObject( 'RigidBodyProxy', proxy );

    		return contact;
    	}

    	var meshConvex = (function(){
    		var convex_to_mesh = new Goblin.Matrix4(),
    			convex_aabb_in_mesh = new Goblin.AABB();

    		return function meshConvex( mesh, convex, addContact ) {
    			// Find matrix that converts convex into mesh space
    			convex_to_mesh.copy( convex.transform );
    			convex_to_mesh.multiply( mesh.transform_inverse );

    			convex_aabb_in_mesh.transform( convex.aabb, mesh.transform_inverse );

    			// Traverse the BHV in mesh
    			var pending_nodes = [ mesh.shape.hierarchy ],
    				node;
    			while ( ( node = pending_nodes.shift() ) ) {
    				if ( node.aabb.intersects( convex_aabb_in_mesh ) ) {
    					if ( node.isLeaf() ) {
    						// Check node for collision
    						var contact = triangleConvex( node.object, mesh, convex );
    						if ( contact != null ) {
    							var _mesh = mesh;
    							while ( _mesh.parent != null ) {
    								_mesh = _mesh.parent;
    							}
    							contact.object_a = _mesh;
    							addContact( _mesh, convex, contact );
    						}
    					} else {
    						pending_nodes.push( node.left, node.right );
    					}
    				}
    			}
    		};
    	})();

    	return function meshCollision( object_a, object_b ) {
    		var a_is_mesh = object_a.shape instanceof Goblin.MeshShape,
    			b_is_mesh = object_b.shape instanceof Goblin.MeshShape;

    		if ( a_is_mesh && b_is_mesh ) {
    			meshMesh( object_a, object_b, this.addContact.bind( this ) );
    		} else {
    			if ( a_is_mesh ) {
    				meshConvex( object_a, object_b, this.addContact.bind( this ) );
    			} else {
    				meshConvex( object_b, object_a, this.addContact.bind( this ) );
    			}
    		}
    	};
    })();

    /**
     * Tests two objects for contact
     *
     * @method getContact
     * @param {RigidBody} object_a
     * @param {RigidBody} object_b
     */
    Goblin.NarrowPhase.prototype.getContact = function( object_a, object_b ) {
    	if ( object_a.shape instanceof Goblin.CompoundShape || object_b.shape instanceof Goblin.CompoundShape ) {
    		this.midPhase( object_a, object_b );
    		return;
    	}

    	if ( object_a.shape instanceof Goblin.MeshShape || object_b.shape instanceof Goblin.MeshShape ) {
    		this.meshCollision( object_a, object_b );
    		return;
    	}

    	var contact;

    	if ( object_a.shape instanceof Goblin.SphereShape && object_b.shape instanceof Goblin.SphereShape ) {
    		// Sphere - Sphere contact check
    		contact = Goblin.SphereSphere( object_a, object_b );
    	} else if (
    		object_a.shape instanceof Goblin.SphereShape && object_b.shape instanceof Goblin.BoxShape ||
    		object_a.shape instanceof Goblin.BoxShape && object_b.shape instanceof Goblin.SphereShape
    	) {
    		// Sphere - Box contact check
    		contact = Goblin.BoxSphere( object_a, object_b );
    	} else {
    		// contact check based on GJK
    		var simplex = Goblin.GjkEpa.GJK( object_a, object_b );
    		if ( Goblin.GjkEpa.result != null ) {
    			contact = Goblin.GjkEpa.result;
    		} else if ( simplex != null ) {
    			contact = Goblin.GjkEpa.EPA( simplex );
    		}
    	}

    	return contact;
    };

    Goblin.NarrowPhase.prototype.addContact = function( object_a, object_b, contact ) {
    	this.contact_manifolds.getManifoldForObjects( object_a, object_b ).addContact( contact );
    };

    /**
     * Loops over the passed array of object pairs which may be in contact
     * valid contacts are put in this object's `contacts` property
     *
     * @param possible_contacts {Array}
     */
    Goblin.NarrowPhase.prototype.generateContacts = function( possible_contacts ) {
    	var i,
    		contact,
    		possible_contacts_length = possible_contacts.length;

    	// Make sure all of the manifolds are up to date
    	this.updateContactManifolds();

    	for ( i = 0; i < possible_contacts_length; i++ ) {
    		contact = this.getContact( possible_contacts[i][0], possible_contacts[i][1] );
    		if ( contact != null ) {
    			this.addContact( possible_contacts[i][0], possible_contacts[i][1], contact );
    		}
    	}
    };

    Goblin.NarrowPhase.prototype.removeBody = function( body ) {
    	var manifold = this.contact_manifolds.first;

    	while ( manifold != null ) {
    		if ( manifold.object_a === body || manifold.object_b === body ) {
    			for ( var i = 0; i < manifold.points.length; i++ ) {
    				manifold.points[i].destroy();
    			}
    			manifold.points.length = 0;
    		}

    		manifold = manifold.next;
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
    	 * key/value map of registered types
    	 *
    	 * @property types
    	 * @private
    	 */
    	types: {},

    	/**
    	 * key/pool map of object type - to - object pool
    	 *
    	 * @property pools
    	 * @private
    	 */
    	pools: {},

    	/**
    	 * registers a type of object to be available in pools
    	 *
    	 * @param key {String} key associated with the object to register
    	 * @param constructing_function {Function} function which will return a new object
    	 */
    	registerType: function( key, constructing_function ) {
    		this.types[ key ] = constructing_function;
    		this.pools[ key ] = [];
    	},

    	/**
    	 * retrieve a free object from the specified pool, or creates a new object if one is not available
    	 *
    	 * @param key {String} key of the object type to retrieve
    	 * @return {Mixed} object of the type asked for, when done release it with `ObjectPool.freeObject`
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
    	 * adds on object to the object pool so it can be reused
    	 *
    	 * @param key {String} type of the object being freed, matching the key given to `registerType`
    	 * @param object {Mixed} object to release into the pool
    	 */
    	freeObject: function( key, object ) {
    		if ( object.removeAllListeners != null ) {
    			object.removeAllListeners();
    		}
    		this.pools[ key ].push( object );
    	}
    };

    // register the objects used in Goblin
    Goblin.ObjectPool.registerType( 'ContactDetails', function() { return new Goblin.ContactDetails(); } );
    Goblin.ObjectPool.registerType( 'ContactManifold', function() { return new Goblin.ContactManifold(); } );
    Goblin.ObjectPool.registerType( 'GJK2SupportPoint', function() { return new Goblin.GjkEpa.SupportPoint( new Goblin.Vector3(), new Goblin.Vector3(), new Goblin.Vector3() ); } );
    Goblin.ObjectPool.registerType( 'ConstraintRow', function() { return new Goblin.ConstraintRow(); } );
    Goblin.ObjectPool.registerType( 'ContactConstraint', function() { return new Goblin.ContactConstraint(); } );
    Goblin.ObjectPool.registerType( 'FrictionConstraint', function() { return new Goblin.FrictionConstraint(); } );
    Goblin.ObjectPool.registerType( 'RayIntersection', function() { return new Goblin.RayIntersection(); } );
    Goblin.ObjectPool.registerType( 'RigidBodyProxy', function() { return new Goblin.RigidBodyProxy(); } );
    Goblin.RigidBodyProxy = function() {
    	this.parent = null;
    	this.id = null;

    	this.shape = null;

    	this.aabb = new Goblin.AABB();

    	this._mass = null;
    	this._mass_inverted = null;

    	this.position = new Goblin.Vector3();
    	this.rotation = new Goblin.Quaternion();

    	this.transform = new Goblin.Matrix4();
    	this.transform_inverse = new Goblin.Matrix4();

    	this.restitution = null;
    	this.friction = null;
    };

    Object.defineProperty(
    	Goblin.RigidBodyProxy.prototype,
    	'mass',
    	{
    		get: function() {
    			return this._mass;
    		},
    		set: function( n ) {
    			this._mass = n;
    			this._mass_inverted = 1 / n;
    			this.inertiaTensor = this.shape.getInertiaTensor( n );
    		}
    	}
    );

    Goblin.RigidBodyProxy.prototype.setFrom = function( parent, shape_data ) {
    	this.parent = parent;

    	this.id = parent.id;

    	this.shape = shape_data.shape;
    	this.shape_data = shape_data;

    	this._mass = parent._mass;

    	parent.transform.transformVector3Into( shape_data.position, this.position );
    	this.rotation.multiplyQuaternions( parent.rotation, shape_data.rotation );

    	this.transform.makeTransform( this.rotation, this.position );
    	this.transform.invertInto( this.transform_inverse );

    	this.aabb.transform( this.shape.aabb, this.transform );

    	this.restitution = parent.restitution;
    	this.friction = parent.friction;
    };

    Goblin.RigidBodyProxy.prototype.findSupportPoint = Goblin.RigidBody.prototype.findSupportPoint;

    Goblin.RigidBodyProxy.prototype.getRigidBody = function() {
    	var body = this.parent;
    	while ( body.parent ) {
    		body = this.parent;
    	}
    	return body;
    };
    /**
     * Manages the physics simulation
     *
     * @class World
     * @param broadphase {Goblin.Broadphase} the broadphase used by the world to find possible contacts
     * @param narrowphase {Goblin.NarrowPhase} the narrowphase used by the world to generate valid contacts
     * @constructor
     */
    Goblin.World = function( broadphase, narrowphase, solver ) {
    	/**
    	 * How many time steps have been simulated. If the steps are always the same length then total simulation time = world.ticks * time_step
    	 *
    	 * @property ticks
    	 * @type {number}
    	 */
    	this.ticks = 0;

    	/**
    	 * The broadphase used by the world to find possible contacts
    	 *
    	 * @property broadphase
    	 * @type {Goblin.Broadphase}
    	 */
    	this.broadphase = broadphase;

    	/**
    	 * The narrowphase used by the world to generate valid contacts
    	 *
    	 * @property narrowphasee
    	 * @type {Goblin.NarrowPhase}
    	 */
    	this.narrowphase = narrowphase;

    	/**
    	 * The contact solver used by the world to calculate and apply impulses resulting from contacts
    	 *
    	 * @property solver
    	 */
    	this.solver = solver;
    	solver.world = this;

    	/**
    	 * Array of rigid bodies in the world
    	 *
    	 * @property rigid_bodies
    	 * @type {Array}
    	 * @default []
    	 * @private
    	 */
    	this.rigid_bodies = [];

    	/**
    	 * Array of ghost bodies in the world
    	 *
    	 * @property ghost_bodies
    	 * @type {Array}
    	 * @default []
    	 * @private
    	 */
    	this.ghost_bodies = [];

    	/**
    	* the world's gravity, applied by default to all objects in the world
    	*
    	* @property gravity
    	* @type {vec3}
    	* @default [ 0, -9.8, 0 ]
    	*/
    	this.gravity = new Goblin.Vector3( 0, -9.8, 0 );

    	/**
    	 * array of force generators in the world
    	 *
    	 * @property force_generators
    	 * @type {Array}
    	 * @default []
    	 * @private
    	 */
    	this.force_generators = [];

    	this.listeners = {};
    };
    Goblin.EventEmitter.apply( Goblin.World );

    /**
    * Steps the physics simulation according to the time delta
    *
    * @method step
    * @param time_delta {Number} amount of time to simulate, in seconds
    * @param [max_step] {Number} maximum time step size, in seconds
    */
    Goblin.World.prototype.step = function( time_delta, max_step ) {
        max_step = max_step || time_delta;

    	var x, delta, time_loops,
            i, loop_count, body;

        time_loops = time_delta / max_step;
        for ( x = 0; x < time_loops; x++ ) {
    		this.ticks++;
            delta = Math.min( max_step, time_delta );
            time_delta -= max_step;

    		this.emit( 'stepStart', this.ticks, delta );

    		// Apply gravity
            for ( i = 0, loop_count = this.rigid_bodies.length; i < loop_count; i++ ) {
                body = this.rigid_bodies[i];

                // Objects of infinite mass don't move
                if ( body._mass !== Infinity ) {
    				_tmp_vec3_1.scaleVector( body.gravity || this.gravity, body._mass * delta );
                    body.accumulated_force.add( _tmp_vec3_1 );
                }
            }

            // Apply force generators
            for ( i = 0, loop_count = this.force_generators.length; i < loop_count; i++ ) {
                this.force_generators[i].applyForce();
            }

    		// Integrate rigid bodies
    		for ( i = 0, loop_count = this.rigid_bodies.length; i < loop_count; i++ ) {
    			body = this.rigid_bodies[i];
    			body.integrate( delta );
    		}

    		for ( i = 0, loop_count = this.rigid_bodies.length; i < loop_count; i++ ) {
    			this.rigid_bodies[i].updateDerived();
    		}

            // Check for contacts, broadphase
            this.broadphase.update();

            // Find valid contacts, narrowphase
            this.narrowphase.generateContacts( this.broadphase.collision_pairs );

            // Process contact manifolds into contact and friction constraints
            this.solver.processContactManifolds( this.narrowphase.contact_manifolds );

            // Prepare the constraints by precomputing some values
            this.solver.prepareConstraints( delta );

            // Resolve contacts
            this.solver.resolveContacts();

            // Run the constraint solver
            this.solver.solveConstraints();

            // Apply the constraints
            this.solver.applyConstraints( delta );

    		// Uppdate ghost bodies
    		for ( i = 0; i < this.ghost_bodies.length; i++ ) {
    			body = this.ghost_bodies[i];
    			body.checkForEndedContacts();
    		}

    		this.emit( 'stepEnd', this.ticks, delta );
        }
    };

    /**
     * Adds a rigid body to the world
     *
     * @method addRigidBody
     * @param rigid_body {Goblin.RigidBody} rigid body to add to the world
     */
    Goblin.World.prototype.addRigidBody = function( rigid_body ) {
    	rigid_body.world = this;
    	rigid_body.updateDerived();
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
    	var i;

    	for ( i = 0; i < this.rigid_bodies.length; i++ ) {
    		if ( this.rigid_bodies[i] === rigid_body ) {
    			this.rigid_bodies.splice( i, 1 );
    			this.broadphase.removeBody( rigid_body );
    			break;
    		}
    	}

    	// remove any contact & friction constraints associated with this body
    	// this calls contact.destroy() for all relevant contacts
    	// which in turn cleans up the iterative solver
    	this.narrowphase.removeBody( rigid_body );
    };

    /**
     * Adds a ghost body to the world
     *
     * @method addGhostBody
     * @param ghost_body {Goblin.GhostBody} ghost body to add to the world
     */
    Goblin.World.prototype.addGhostBody = function( ghost_body ) {
    	ghost_body.world = this;
    	ghost_body.updateDerived();
    	this.ghost_bodies.push( ghost_body );
    	this.broadphase.addBody( ghost_body );
    };

    /**
     * Removes a ghost body from the world
     *
     * @method removeGhostBody
     * @param ghost_body {Goblin.GhostBody} ghost body to remove from the world
     */
    Goblin.World.prototype.removeGhostBody = function( ghost_body ) {
    	for ( var i = 0; i < this.ghost_bodies.length; i++ ) {
    		if ( this.ghost_bodies[i] === ghost_body ) {
    			this.ghost_bodies.splice( i, 1 );
    			this.broadphase.removeBody( ghost_body );
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
     * @param constraint {Goblin.Constraint} constraint to be added
     */
    Goblin.World.prototype.addConstraint = function( constraint ) {
    	this.solver.addConstraint( constraint );
    };

    /**
     * removes a constraint from the world
     *
     * @method removeConstraint
     * @param constraint {Goblin.Constraint} constraint to be removed
     */
    Goblin.World.prototype.removeConstraint = function( constraint ) {
    	this.solver.removeConstraint( constraint );
    };

    (function(){
    	var tSort = function( a, b ) {
    		if ( a.t < b.t ) {
    			return -1;
    		} else if ( a.t > b.t ) {
    			return 1;
    		} else {
    			return 0;
    		}
    	};

    	/**
    	 * Checks if a ray segment intersects with objects in the world
    	 *
    	 * @method rayIntersect
    	 * @property start {vec3} start point of the segment
    	 * @property end {vec3{ end point of the segment
    	 * @return {Array<RayIntersection>} an array of intersections, sorted by distance from `start`
    	 */
    	Goblin.World.prototype.rayIntersect = function( start, end ) {
    		var intersections = this.broadphase.rayIntersect( start, end );
    		intersections.sort( tSort );
    		return intersections;
    	};

    	Goblin.World.prototype.shapeIntersect = function( shape, start, end ){
    		var swept_shape = new Goblin.LineSweptShape( start, end, shape ),
    			swept_body = new Goblin.RigidBody( swept_shape, 0 );
    		swept_body.updateDerived();

    		var possibilities = this.broadphase.intersectsWith( swept_body ),
    			intersections = [];

    		for ( var i = 0; i < possibilities.length; i++ ) {
    			var contact = this.narrowphase.getContact( swept_body, possibilities[i] );

    			if ( contact != null ) {
    				var intersection = Goblin.ObjectPool.getObject( 'RayIntersection' );
    				intersection.object = contact.object_b;
    				intersection.normal.copy( contact.contact_normal );

    				// compute point
    				intersection.point.scaleVector( contact.contact_normal, -contact.penetration_depth );
    				intersection.point.add( contact.contact_point );

    				// compute time
    				intersection.t = intersection.point.distanceTo( start );

    				intersections.push( intersection );
    			}
    		}

    		intersections.sort( tSort );
    		return intersections;
    	};
    })();
    	if ( typeof window !== 'undefined' ) window.Goblin = Goblin;
    	if ( typeof self !== 'undefined' ) self.Goblin = Goblin;
    	if ( typeof module !== 'undefined' ) module.exports = Goblin;
    })();

    var Goblin = self.Goblin || _goblin;

    var _tmp_vector3_1 = new Goblin.Vector3();

    var MESSAGE_TYPES = {
    	REPORTS: {
    		/**
    		 * world report containing matrix data for rigid bodies
    		 * element [1] is how many simulation ticks have been processed (world.ticks)
    		 * element [2] is number of rigid bodies in the array
    		 * 2...n elements are the bodies' matrix data
    		 */
    		WORLD: 0,

    		/**
    		 * contains details for new contacts
    		 * element [1] is the number of collisions, each collision is represented by:
    		 * [object_a_id, object_b_id, world_contact_point{xyz}, contact_normal{xyz}, linear_velocity_delta{xyz}, angular_velocity_delta{xyz}, penetration_depth]
    		 */
    		COLLISIONS: 1
    	},

    	/**
    	 * initializes the physics world
    	 * [broadphase] String either 'sap' or 'naive' [default 'sap']
    	 * [gravity] Object with float properties `x`, `y`, `z` [default {x:0, y:-9.8, z:0} ]
    	 */
    	INITIALIZE: 'INITIALIZE',

    	ADD_GHOSTBODY: 'ADD_GHOSTBODY',
    	/**
    	 * adds a ghost body to the world
    	 * body_id Integer unique id for the body
    	 * shape_description Object definition corresponding to the type of rigid body (see BODY_TYPES)
    	 * collision_groups Integer body's collision groups
    	 * collision_mask Integer body's collision mask
    	 */

    	/**
    	 * adds a rigid body to the world
    	 * body_id Integer unique id for the body
    	 * shape_description Object definition corresponding to the type of rigid body (see BODY_TYPES)
    	 * mass Float amount of mass the body has, 0 or Infinity creates a static object
    	 * restitution Float body's restitution
    	 * friction Float body's friction
    	 * linear_damping Float body's linear damping
    	 * angular_damping Float body's angular damping
    	 * collision_groups Integer body's collision groups
    	 * collision_mask Integer body's collision mask
    	 */
    	ADD_RIGIDBODY: 'ADD_RIGIDBODY',

    	/**
    	 * applys a force at a local location
    	 * body_id Integer unique integer id for the body
    	 * force Object force to apply to the body {x:x, y:y, z:z}
    	 * local_location Object where, relative to the body, the force is applied {x:x, y:y, z:z}
    	 */
    	APPLY_FORCE: 'APPLY_FORCE',

    	/**
    	 * removes a ghost body from the world
    	 * body_id Integer unique id of the body
    	 */
    	REMOVE_GHOSTBODY: 'REMOVE_GHOSTBODY',

    	/**
    	 * removes a rigid body from the world
    	 * body_id Integer unique id of the body
    	 */
    	REMOVE_RIGIDBODY: 'REMOVE_RIGIDBODY',

    	/**
    	 * sets the specified rigid body's mass
    	 * body_id Integer unique integer id for the body
    	 * mass Float new mass value
    	 */
    	SET_RIGIDBODY_MASS: 'SET_RIGIDBODY_MASS',

    	/**
    	 * sets the specified rigid body's restitution
    	 * body_id Integer unique integer id for the body
    	 * mass Float new restitution value
    	 */
    	SET_RIGIDBODY_RESTITUTION: 'SET_RIGIDBODY_RESTITUTION',

    	/**
    	 * sets the specified rigid body's friction
    	 * body_id Integer unique integer id for the body
    	 * mass Float new friction value
    	 */
    	SET_RIGIDBODY_FRICTION: 'SET_RIGIDBODY_FRICTION',

    	/**
    	 * sets the specified rigid body's linear damping
    	 * body_id Integer unique integer id for the body
    	 * damping Float new linear damping value
    	 */
    	SET_RIGIDBODY_LINEAR_DAMPING: 'SET_RIGIDBODY_LINEAR_DAMPING',

    	/**
    	 * sets the specified rigid body's angular damping
    	 * body_id Integer unique integer id for the body
    	 * damping Float new angular damping value
    	 */
    	SET_RIGIDBODY_ANGULAR_DAMPING: 'SET_RIGIDBODY_ANGULAR_DAMPING',

    	/**
    	 * sets the specified rigid body's collision groups
    	 * body_id Integer unique integer id for the body
    	 * groups Integer new collision group value
    	 */
    	SET_RIGIDBODY_COLLISION_GROUPS: 'SET_RIGIDBODY_COLLISION_GROUPS',

    	/**
    	 * sets the specified rigid body's collision mask
    	 * body_id Integer unique integer id for the body
    	 * mask Integer new collision mask value
    	 */
    	SET_RIGIDBODY_COLLISION_MASK: 'SET_RIGIDBODY_COLLISION_MASK',

    	/**
    	 * sets the specified rigid body's position & rotation
    	 * body_id Integer unique integer id for the body
    	 * position Object new coordinates for the body's position, {x:x, y:y, z:z}
    	 * rotation Object new quaternion values {x:x, y:y, z:z, w:w}
    	 */
    	SET_RIGIDBODY_TRANSFORM: 'SET_RIGIDBODY_TRANSFORM',

    	/**
    	 * sets the specified rigid body's linear velocity
    	 * body_id Integer unique integer id for the body
    	 * velocity Object new values for the body's linear velocity, {x:x, y:y, z:z}
    	 */
    	SET_RIGIDBODY_LINEAR_VELOCITY: 'SET_RIGIDBODY_LINEAR_VELOCITY',

    	/**
    	 * sets the specified rigid body's angular velocity
    	 * body_id Integer unique integer id for the body
    	 * velocity Object new values for the body's angular velocity, {x:x, y:y, z:z}
    	 */
    	SET_RIGIDBODY_ANGULAR_VELOCITY: 'SET_RIGIDBODY_ANGULAR_VELOCITY',

    	/**
    	 * sets the specified rigid body's linear factor
    	 * body_id Integer unique integer id for the body
    	 * factor Object new values for the body's linear factor, {x:x, y:y, z:z}
    	 */
    	SET_RIGIDBODY_LINEAR_FACTOR: 'SET_RIGIDBODY_LINEAR_FACTOR',

    	/**
    	 * sets the specified rigid body's angular factor
    	 * body_id Integer unique integer id for the body
    	 * factor Object new values for the body's angular factor, {x:x, y:y, z:z}
    	 */
    	SET_RIGIDBODY_ANGULAR_FACTOR: 'SET_RIGIDBODY_ANGULAR_FACTOR',

    	/**
    	 * steps the physics simulation
    	 * time_delta Float total amount of time, in seconds, to step the simulation by
    	 * [max_step] Float maximum step of size, in seconds [default is value of `time_delta`]
    	 */
    	STEP_SIMULATION: 'STEP_SIMULATION',

    	/**
    	 * performs ray traces
    	 * raytrace_id unique identifier for this request
    	 * rays Array[ { start: { x:x, y:y, z:z }, end: { x:x, y:y, z:z } } ]
    	 */
    	RAYTRACE: 'RAYTRACE',

    	/**
    	 * results of a raytrace request
    	 * raytrace_id unique identifier of the request
    	 * results Array[ Array[ { body_id:body_id, point: { x:x, y:y, z:z }, normal: { x:x, y:y, z:z } } ] ]
    	 */
    	RAYTRACE_RESULTS: 'RAYTRACE_RESULTS',

    	/**
    	 * adds a constraint on one or two bodies to the world
    	 * entirety of the message body corresponds to the type of constraint (see CONSTRAINT_TYPES)
    	 */
    	ADD_CONSTRAINT: 'ADD_CONSTRAINT'
    };

    var CONSTRAINT_TYPES = {
        /**
         * constraint_type String type of constraint
         * constraint_id Number id of the constraint
         * body_a_id Number id of body_a
         * hinge_axis Object axis in body_a the hinge revolves around {x:x, y:y, z:z}
         * point_a Object point in body_a the hinge revolves around {x:x, y:y, z:z}
         * body_b_id [optional] Number id of body_b
         * point_b [optional] Object point in body_b the hinge revolves around {x:x, y:y, z:z}
         * active Boolean whether or not the constraint is enabled
         * factor: Number factor applied to constraint, 0-1
         * breaking_threshold: Number amount of force which, if exceeded, de-activates the constraint
         * limit.enabled Boolean whether or not the limits are set
         * limit.lower Number lower bound of limit
         * limit.upper Number upper bound of limit
         * motor.enabled Boolean whether or not the motor is on
         * motor.torque Number maximum torque the motor can apply
         * motor.max_speed Number maximum speed the motor can reach under its own power
         */
        HINGE: 'HINGE'
    }

    var CONTACT_TYPES = {
    	START: 0,
    	CONTINUE: 1,
    	END: 2
    };

    var BODY_TYPES = {
    	/**
    	 * width Float box extent on x axis
    	 * height Float box extent on y axis
    	 * depth Float box extent on z axis
    	 */
    	BOX: 'BOX',

    	/**
    	 * shapes Array list of shape definitions composing the compound shape
    	 */
    	COMPOUND: 'COMPOUND',

    	/**
    	 * radius Float cylinder radius
    	 * height Float cylinder extent on y axis
    	 */
    	CONE: 'CONE',

    	/**
    	 * vertices Array list of vertex components for all vertices, where list is [x1, y1, z1, x2, y2, z2 ... xN, yN, zN]
    	 */
    	CONVEX: 'CONVEX',

    	/**
    	 * radius Float cylinder radius
    	 * height Float cylinder extent on y axis
    	 */
    	CYLINDER: 'CYLINDER',

    	/**
    	 * width Float plane extent on x axis
    	 * height Float plane extent on y axis
    	 */
    	PLANE: 'PLANE',

    	/**
    	 * radius Float radius of the sphere
    	 */
    	SPHERE: 'SPHERE',

    	/**
    	 * vertices Array list of vertex components for all vertices, where list is [x1, y1, z1, x2, y2, z2 ... xN, yN, zN]
    	 * faces Array list of vertex indexes composing the faces
    	 */
    	TRIANGLE: 'TRIANGLE'
    }

    var _tmp_vector3_2 = new Goblin.Vector3();

    // report-related variables and constants
    function ensureReportSize( report, report_size, chunk_size ) {
    	var needed_buffer_size = ( report_size + 3 ) + chunk_size - report_size % chunk_size; // the +2 is to
    		// add an array element to hold the report type, number of ticks simulation has gone through, and length of array data
    	if ( report.length < needed_buffer_size ) {
    		report = new Float32Array( needed_buffer_size );
    	}
    	return report;
    }
    var WORLD_REPORT_SIZE_RIGIDBODY = 30; // 1 body id + 16 matrix elements + 3 position elements + 4 rotation elements + 3 linear velocity + 3 angular_velocity
    var WORLD_REPORT_CHUNK_SIZE = 100 * WORLD_REPORT_SIZE_RIGIDBODY; // increase buffer by enough to hold 100 objects each time
    var world_report = new Float32Array( 0 );

    var COLLISION_REPORT_SIZE = 15; // 2 body ids + 4 Vector3s + penetration depth
    var COLLISION_REPORT_CHUNK_SIZE = 100 * COLLISION_REPORT_SIZE;
    var collision_report = new Float32Array( 0 );

    // global variables for the simulation
    var world;
    var id_body_map = {};
    var body_id_map = {};
    var id_constraint_map = {};
    var collision_events = [];

    function postMessage( type, parameters ) {
    	self.postMessage({
    		type: type,
    		parameters: parameters
    	});
    }

    function postReport( report ) {
    	self.postMessage( report, [report.buffer] );
    }

    function reportWorld() {
    	// compute necessary buffer size
    	var rigid_body_ids = Object.keys( id_body_map );
    	var rigid_bodies_count = rigid_body_ids.length;
    	var report_size = ( WORLD_REPORT_SIZE_RIGIDBODY * rigid_bodies_count ); // elements needed to report bodies
    	world_report = ensureReportSize( world_report, report_size, WORLD_REPORT_CHUNK_SIZE );

    	// populate the report
    	var idx = 0;
    	world_report[idx++] = MESSAGE_TYPES.REPORTS.WORLD;
    	world_report[idx++] = world.ticks;
    	world_report[idx++] = rigid_bodies_count;

    	for ( var i = 0; i < rigid_bodies_count; i++ ) {
    		var rigid_body_id = rigid_body_ids[ i ];
    		var rigid_body = id_body_map[ rigid_body_id ];
    		world_report[idx++] = rigid_body_id;

    		world_report[idx++] = rigid_body.transform.e00;
    		world_report[idx++] = rigid_body.transform.e01;
    		world_report[idx++] = rigid_body.transform.e02;
    		world_report[idx++] = rigid_body.transform.e03;

    		world_report[idx++] = rigid_body.transform.e10;
    		world_report[idx++] = rigid_body.transform.e11;
    		world_report[idx++] = rigid_body.transform.e12;
    		world_report[idx++] = rigid_body.transform.e13;

    		world_report[idx++] = rigid_body.transform.e20;
    		world_report[idx++] = rigid_body.transform.e21;
    		world_report[idx++] = rigid_body.transform.e22;
    		world_report[idx++] = rigid_body.transform.e23;

    		world_report[idx++] = rigid_body.transform.e30;
    		world_report[idx++] = rigid_body.transform.e31;
    		world_report[idx++] = rigid_body.transform.e32;
    		world_report[idx++] = rigid_body.transform.e33;

    		world_report[idx++] = rigid_body.position.x;
    		world_report[idx++] = rigid_body.position.y;
    		world_report[idx++] = rigid_body.position.z;

    		world_report[idx++] = rigid_body.rotation.x;
    		world_report[idx++] = rigid_body.rotation.y;
    		world_report[idx++] = rigid_body.rotation.z;
    		world_report[idx++] = rigid_body.rotation.w;

    		world_report[idx++] = rigid_body.linear_velocity.x;
    		world_report[idx++] = rigid_body.linear_velocity.y;
    		world_report[idx++] = rigid_body.linear_velocity.z;

    		world_report[idx++] = rigid_body.angular_velocity.x;
    		world_report[idx++] = rigid_body.angular_velocity.y;
    		world_report[idx++] = rigid_body.angular_velocity.z;
    	}

    	postReport( world_report );
    }

    function reportCollisions() {
    	// divided by 2 because each new collision triggers two `contact` events and the second is a duplicate
    	// divided by 10 as each entry in `collision_events` spans ten indices
    	var event_size = 10;
    	var collision_events_count = collision_events.length / 2 / event_size;

    	// compute buffer size
    	var report_size = ( COLLISION_REPORT_SIZE * collision_events_count ); // elements needed to report collisions
    	collision_report = ensureReportSize( collision_report, report_size, COLLISION_REPORT_SIZE );
    	collision_report[0] = MESSAGE_TYPES.REPORTS.COLLISIONS;
    	collision_report[1] = collision_events_count;

    	var report_idx = 2;

    	for ( var i = 0; i < collision_events.length; i += 2 * event_size ) { // multiply by 2 to skip the same contact event for the other object
    		var object_a = collision_events[i+1];
    		var object_b = collision_events[i+2];
    		var contact = collision_events[i+3];

    		collision_report[report_idx+0] = collision_events[i+0];

    		collision_report[report_idx+1] = body_id_map[ object_a.id ];
    		collision_report[report_idx+2] = body_id_map[ object_b.id ];

    		collision_report[report_idx+3] = contact ? contact.contact_point.x : 0;
    		collision_report[report_idx+4] = contact ? contact.contact_point.y : 0;
    		collision_report[report_idx+5] = contact ? contact.contact_point.z : 0;

    		collision_report[report_idx+6] = contact ? contact.contact_normal.x : 0;
    		collision_report[report_idx+7] = contact ? contact.contact_normal.y : 0;
    		collision_report[report_idx+8] = contact ? contact.contact_normal.z : 0;

    		collision_report[report_idx+9] = collision_events[i+4];
    		collision_report[report_idx+10] = collision_events[i+5];
    		collision_report[report_idx+11] = collision_events[i+6];

    		collision_report[report_idx+12] = collision_events[i+7];
    		collision_report[report_idx+13] = collision_events[i+8];
    		collision_report[report_idx+14] = collision_events[i+9];

    		collision_report[report_idx+15] = contact ? contact.penetration_depth : 0;

    		report_idx += COLLISION_REPORT_SIZE;
    	}

    	collision_events.length = 0;

    	postReport( collision_report );
    }

    function getShapeForDefinition( shape_definition ) {
    	var shape;

    	if ( shape_definition.body_type === BODY_TYPES.BOX ) {
    		shape = new Goblin.BoxShape(shape_definition.width, shape_definition.height, shape_definition.depth);
    	} else if ( shape_definition.body_type === BODY_TYPES.COMPOUND ) {
    		shape = new Goblin.CompoundShape();
    		shape_definition.shapes.forEach(function( child_shape ) {
    			shape.addChildShape(
    				getShapeForDefinition( child_shape.shape_definition ),
    				new Goblin.Vector3( child_shape.position.x, child_shape.position.y, child_shape.position.z ),
    				new Goblin.Quaternion( child_shape.quaternion.x, child_shape.quaternion.y, child_shape.quaternion.z, child_shape.quaternion.w )
    			);
    		});
    	} else if ( shape_definition.body_type === BODY_TYPES.CONE ) {
    		shape = new Goblin.ConeShape(shape_definition.radius, shape_definition.height);
    	} else if ( shape_definition.body_type === BODY_TYPES.CONVEX ) {
    		shape = new Goblin.ConvexShape(
    			shape_definition.vertices.reduce(
    				function( vertices, component, idx, source ) {
    					if (idx % 3 == 0) {
    						vertices.push(
    							new Goblin.Vector3( source[idx], source[idx+1], source[idx+2] )
    						);
    					}
    					return vertices;
    				},
    				[]
    			)
    		);
    	} else if ( shape_definition.body_type === BODY_TYPES.CYLINDER ) {
    		shape = new Goblin.CylinderShape( shape_definition.radius, shape_definition.height );
    	} else if ( shape_definition.body_type === BODY_TYPES.PLANE ) {
    		shape = new Goblin.PlaneShape( 2, shape_definition.width, shape_definition.height );
    	} else if ( shape_definition.body_type === BODY_TYPES.SPHERE ) {
    		shape = new Goblin.SphereShape( shape_definition.radius );
    	} else if ( shape_definition.body_type === BODY_TYPES.TRIANGLE ) {
    		shape = new Goblin.MeshShape(
    			shape_definition.vertices.reduce(
    				function( vertices, component, idx, source ) {
    					if (idx % 3 == 0) {
    						vertices.push(
    							new Goblin.Vector3( source[idx], source[idx+1], source[idx+2] )
    						);
    					}
    					return vertices;
    				},
    				[]
    			),
    			shape_definition.faces
    		);
    	}

    	return shape;
    }

    // message handling
    (function() {
    	var handlers = {};
    	function handleMessage( message, handler ) {
    		handlers[message] = handler;
    	}
    	self.addEventListener(
    		'message',
    		function(e) {
    			var data = e.data;
    			var type;
    			var parameters;

    			if ( data instanceof Float32Array ) {
    				type = data[0];
    				parameters = data;
    			} else {
    				data = data || {};
    				type = data.type;
    				parameters = data.parameters;
    			}

    			if ( handlers.hasOwnProperty( type ) ) {
    				handlers[type]( parameters );
    			} else {
    				throw new Error( 'Physijs worker received unknown message type: ' + type );
    			}
    		}
    	);

    	handleMessage(
    		MESSAGE_TYPES.REPORTS.WORLD,
    		function( report ) {
    			world_report = report;
    		}
    	);

    	handleMessage(
    		MESSAGE_TYPES.REPORTS.COLLISIONS,
    		function( report ) {
    			collision_report = report;
    		}
    	);

    	handleMessage(
    		MESSAGE_TYPES.INITIALIZE,
    		function( parameters ) {
    			var broadphase = parameters.broadphase === 'naive' ? new Goblin.BasicBroadphase() : new Goblin.SAPBroadphase();

    			world = new Goblin.World(
    				broadphase,
    				new Goblin.NarrowPhase(),
    				new Goblin.IterativeSolver()
    			);

    			if ( parameters.hasOwnProperty('gravity') ) {
    				world.gravity.set( parameters.gravity.x, parameters.gravity.y, parameters.gravity.z );
    			}
    		}
    	);

    	handleMessage(
    		MESSAGE_TYPES.ADD_GHOSTBODY,
    		function( parameters ) {
    			var shape_definition = parameters.shape_definition;
    			var shape = getShapeForDefinition( shape_definition );
    			var body = new Goblin.GhostBody( shape );

    			body.collision_groups = parameters.collision_groups;
    			body.collision_mask = parameters.collision_mask;

    			body.addListener(
    				'contact',
    				function( other_body, contact ) {
    					collision_events.push( CONTACT_TYPES.START, this, other_body, contact );

    					// find relative velocities
    					_tmp_vector3_1.subtractVectors( other_body.linear_velocity, this.linear_velocity );
    					collision_events.push( _tmp_vector3_1.x, _tmp_vector3_1.y, _tmp_vector3_1.z );

    					_tmp_vector3_1.subtractVectors( other_body.angular_velocity, this.angular_velocity );
    					collision_events.push( _tmp_vector3_1.x, _tmp_vector3_1.y, _tmp_vector3_1.z );
    				}
    			);

    			body.addListener(
    				'endAllContact',
    				function( other_body ) {
    					collision_events.push( CONTACT_TYPES.END, this, other_body, null );

    					// find relative velocities
    					_tmp_vector3_1.subtractVectors( other_body.linear_velocity, this.linear_velocity );
    					collision_events.push( _tmp_vector3_1.x, _tmp_vector3_1.y, _tmp_vector3_1.z );

    					_tmp_vector3_1.subtractVectors( other_body.angular_velocity, this.angular_velocity );
    					collision_events.push( _tmp_vector3_1.x, _tmp_vector3_1.y, _tmp_vector3_1.z );
    				}
    			);

    			body.addListener(
    				'contactStart',
    				function( other_body, contact ) {
    					collision_events.push( CONTACT_TYPES.START, this, other_body, contact );

    					// find relative velocities
    					collision_events.push( other_body.linear_velocity.x, other_body.linear_velocity.y, other_body.linear_velocity.z );
    					collision_events.push( other_body.angular_velocity.x, other_body.angular_velocity.y, other_body.angular_velocity.z );
    				}
    			);

    			body.addListener(
    				'contactContinue',
    				function( other_body, contact ) {
    					collision_events.push( CONTACT_TYPES.CONTINUE, this, other_body, contact );

    					// find relative velocities
    					collision_events.push( other_body.linear_velocity.x, other_body.linear_velocity.y, other_body.linear_velocity.z );
    					collision_events.push( other_body.angular_velocity.x, other_body.angular_velocity.y, other_body.angular_velocity.z );
    				}
    			);

    			body.addListener(
    				'contactEnd',
    				function( other_body ) {
    					collision_events.push( CONTACT_TYPES.END, this, other_body, null );

    					// find relative velocities
    					collision_events.push( other_body.linear_velocity.x, other_body.linear_velocity.y, other_body.linear_velocity.z );
    					collision_events.push( other_body.angular_velocity.x, other_body.angular_velocity.y, other_body.angular_velocity.z );
    				}
    			);

    			world.addGhostBody( body );

    			id_body_map[ parameters.body_id ] = body;
    			body_id_map[ body.id ] = parameters.body_id;
    		}
    	);

    	handleMessage(
    		MESSAGE_TYPES.ADD_RIGIDBODY,
    		function( parameters ) {
    			var shape_definition = parameters.shape_definition;
    			var shape = getShapeForDefinition( shape_definition );
    			var body = new Goblin.RigidBody( shape, parameters.mass );

    			body.restitution = parameters.restitution;
    			body.friction = parameters.friction;
    			body.linear_damping = parameters.linear_damping;
    			body.angular_damping = parameters.angular_damping;
    			body.collision_groups = parameters.collision_groups;
    			body.collision_mask = parameters.collision_mask;

    			body.addListener(
    				'contact',
    				function( other_body, contact ) {
    					collision_events.push( CONTACT_TYPES.START, this, other_body, contact );

    					// find relative velocities
    					_tmp_vector3_1.subtractVectors( other_body.linear_velocity, this.linear_velocity );
    					collision_events.push( _tmp_vector3_1.x, _tmp_vector3_1.y, _tmp_vector3_1.z );

    					_tmp_vector3_1.subtractVectors( other_body.angular_velocity, this.angular_velocity );
    					collision_events.push( _tmp_vector3_1.x, _tmp_vector3_1.y, _tmp_vector3_1.z );
    				}
    			);

    			body.addListener(
    				'endAllContact',
    				function( other_body ) {
    					collision_events.push( CONTACT_TYPES.END, this, other_body, null );

    					// find relative velocities
    					_tmp_vector3_1.subtractVectors( other_body.linear_velocity, this.linear_velocity );
    					collision_events.push( _tmp_vector3_1.x, _tmp_vector3_1.y, _tmp_vector3_1.z );

    					_tmp_vector3_1.subtractVectors( other_body.angular_velocity, this.angular_velocity );
    					collision_events.push( _tmp_vector3_1.x, _tmp_vector3_1.y, _tmp_vector3_1.z );
    				}
    			);

    			body.addListener(
    				'contactStart',
    				function( other_body, contact ) {
    					collision_events.push( CONTACT_TYPES.START, this, other_body, contact );

    					// find relative velocities
    					collision_events.push( this.linear_velocity.x, this.linear_velocity.y, this.linear_velocity.z );
    					collision_events.push( this.angular_velocity.x, this.angular_velocity.y, this.angular_velocity.z );
    				}
    			);

    			body.addListener(
    				'contactContinue',
    				function( other_body, contact ) {
    					collision_events.push( CONTACT_TYPES.CONTINUE, this, other_body, contact );

    					// find relative velocities
    					collision_events.push( this.linear_velocity.x, this.linear_velocity.y, this.linear_velocity.z );
    					collision_events.push( this.angular_velocity.x, this.angular_velocity.y, this.angular_velocity.z );
    				}
    			);

    			body.addListener(
    				'contactEnd',
    				function( other_body ) {
    					collision_events.push( CONTACT_TYPES.END, this, other_body, null );

    					// find relative velocities
    					collision_events.push( this.linear_velocity.x, this.linear_velocity.y, this.linear_velocity.z );
    					collision_events.push( this.angular_velocity.x, this.angular_velocity.y, this.angular_velocity.z );
    				}
    			);

    			world.addRigidBody( body );

    			id_body_map[ parameters.body_id ] = body;
    			body_id_map[ body.id ] = parameters.body_id;
    		}
    	);

    	handleMessage(
    		MESSAGE_TYPES.APPLY_FORCE,
    		function( parameters ) {
    			var body_id = parameters.body_id;
    			var body = id_body_map[ body_id ];
    			_tmp_vector3_1.set( parameters.force.x, parameters.force.y, parameters.force.z );
    			_tmp_vector3_2.set( parameters.local_location.x, parameters.local_location.y, parameters.local_location.z );
    			body.applyForceAtLocalPoint( _tmp_vector3_1, _tmp_vector3_2 );
    		}
    	);

    	handleMessage(
    		MESSAGE_TYPES.REMOVE_GHOSTBODY,
    		function( parameters ) {
    			var body_id = parameters.body_id;
    			var body = id_body_map[ body_id ];
    			world.removeGhostBody( body );
    			delete id_body_map[ body_id ];
    		}
    	);
    	
    	handleMessage(
    		MESSAGE_TYPES.REMOVE_RIGIDBODY,
    		function( parameters ) {
    			var body_id = parameters.body_id;
    			var body = id_body_map[ body_id ];
    			world.removeRigidBody( body );
    			delete id_body_map[ body_id ];
    		}
    	);

    	handleMessage(
    		MESSAGE_TYPES.SET_RIGIDBODY_MASS,
    		function( parameters ) {
    			id_body_map[ parameters.body_id ].mass = parameters.mass;
    		}
    	);

    	handleMessage(
    		MESSAGE_TYPES.SET_RIGIDBODY_RESTITUTION,
    		function( parameters ) {
    			id_body_map[ parameters.body_id ].restitution = parameters.restitution;
    		}
    	);

    	handleMessage(
    		MESSAGE_TYPES.SET_RIGIDBODY_FRICTION,
    		function( parameters ) {
    			id_body_map[ parameters.body_id ].friction = parameters.friction;
    		}
    	);

    	handleMessage(
    		MESSAGE_TYPES.SET_RIGIDBODY_LINEAR_DAMPING,
    		function( parameters ) {
    			id_body_map[ parameters.body_id ].linear_damping = parameters.damping;
    		}
    	);

    	handleMessage(
    		MESSAGE_TYPES.SET_RIGIDBODY_ANGULAR_DAMPING,
    		function( parameters ) {
    			id_body_map[ parameters.body_id ].angular_damping = parameters.damping;
    		}
    	);

    	handleMessage(
    		MESSAGE_TYPES.SET_RIGIDBODY_COLLISION_GROUPS,
    		function( parameters ) {
    			id_body_map[ parameters.body_id ].collision_groups = parameters.collision_groups;
    		}
    	);

    	handleMessage(
    		MESSAGE_TYPES.SET_RIGIDBODY_COLLISION_MASK,
    		function( parameters ) {
    			id_body_map[ parameters.body_id ].collision_mask = parameters.collision_mask;
    		}
    	);

    	handleMessage(
    		MESSAGE_TYPES.SET_RIGIDBODY_TRANSFORM,
    		function( parameters ) {
    			id_body_map[ parameters.body_id ].position.set(
    				parameters.position.x,
    				parameters.position.y,
    				parameters.position.z
    			);

    			id_body_map[ parameters.body_id ].rotation.set(
    				parameters.rotation.x,
    				parameters.rotation.y,
    				parameters.rotation.z,
    				parameters.rotation.w
    			);

    			id_body_map[ parameters.body_id ].updateDerived();
    		}
    	);

    	handleMessage(
    		MESSAGE_TYPES.SET_RIGIDBODY_LINEAR_VELOCITY,
    		function( parameters ) {
    			id_body_map[ parameters.body_id ].linear_velocity.set(
    				parameters.velocity.x,
    				parameters.velocity.y,
    				parameters.velocity.z
    			);
    		}
    	);

    	handleMessage(
    		MESSAGE_TYPES.SET_RIGIDBODY_ANGULAR_VELOCITY,
    		function( parameters ) {
    			id_body_map[ parameters.body_id ].angular_velocity.set(
    				parameters.velocity.x,
    				parameters.velocity.y,
    				parameters.velocity.z
    			);
    		}
    	);

    	handleMessage(
    		MESSAGE_TYPES.SET_RIGIDBODY_LINEAR_FACTOR,
    		function( parameters ) {
    			id_body_map[ parameters.body_id ].linear_factor.set(
    				parameters.factor.x,
    				parameters.factor.y,
    				parameters.factor.z
    			);
    		}
    	);

    	handleMessage(
    		MESSAGE_TYPES.SET_RIGIDBODY_ANGULAR_FACTOR,
    		function( parameters ) {
    			id_body_map[ parameters.body_id ].angular_factor.set(
    				parameters.factor.x,
    				parameters.factor.y,
    				parameters.factor.z
    			);
    		}
    	);

    	handleMessage(
    		MESSAGE_TYPES.STEP_SIMULATION,
    		function( parameters ) {
    			world.step( parameters.time_delta, parameters.max_step );
    			reportWorld();
    			reportCollisions();
    		}
    	);

    	handleMessage(
    		MESSAGE_TYPES.RAYTRACE,
    		function( parameters ) {
    			var ray_start = new Goblin.Vector3();
    			var ray_end = new Goblin.Vector3();
    			var results = parameters.rays.map(function( ray ) {
    				ray_start.set( ray.start.x, ray.start.y, ray.start.z );
    				ray_end.set( ray.end.x, ray.end.y, ray.end.z );
    				var intersections = world.rayIntersect( ray_start, ray_end );
    				return intersections.map(function(intersection) {
    					var mapped_body = body_id_map[ intersection.object.id ];

    					// only return an intersection if this body is tracked outside this worker
    					if ( mapped_body == null ) {
    						return null;
    					}

    					return {
    						body_id: intersection.object.id,
    						point: { x: intersection.point.x, y: intersection.point.y, z: intersection.point.z },
    						normal: { x: intersection.normal.x, y: intersection.normal.y, z: intersection.normal.z },
    					};
    				}).filter(function(intersection) {
    					return intersection != null;
    				});
    			});

    			postMessage(
    				MESSAGE_TYPES.RAYTRACE_RESULTS,
    				{
    					raytrace_id: parameters.raytrace_id,
    					results: results
    				}
    			);
    		}
    	);

    	handleMessage(
    		MESSAGE_TYPES.ADD_CONSTRAINT,
    		function( parameters ) {
    			var constraint;

    			if ( parameters.constraint_type === CONSTRAINT_TYPES.HINGE ) {
    				constraint = new Goblin.HingeConstraint(
    					id_body_map[ parameters.body_a_id ],
    					new Goblin.Vector3( parameters.hinge_axis.x, parameters.hinge_axis.y, parameters.hinge_axis.z ),
    					new Goblin.Vector3( parameters.point_a.x, parameters.point_a.y, parameters.point_a.z ),
    					parameters.object_b_id == null ? null : id_body_map[parameters.body_b_id],
    					parameters.object_b_id == null ? null : new Goblin.Vector3( parameters.point_b.x, parameters.point_b.y, parameters.point_b.z )
    				);
    				constraint.active = parameters.active;

    				if ( parameters.limit.enabled ) {
    					constraint.limit.set( parameters.limit.lower, parameters.limit.upper );
    				}

    				if ( parameters.motor.enabled ) {
    					constraint.motor.set( parameters.motor.torque, parameters.motor.max_speed );
    				}

    				id_constraint_map[ parameters.constraint_id ] = constraint;
    			}

    			world.addConstraint( constraint );
    		}
    	);
    })();

})();