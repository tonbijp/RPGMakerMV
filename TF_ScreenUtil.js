//========================================
// TF_ScreenUtil.js
// Version :0.0.0.0
// For : RPGツクールMV (RPG Maker MV)
// -----------------------------------------------
// Copyright : Tobishima-Factory 2020
// Website : http://tonbi.jp
//
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//========================================
/*:ja
 * @plugindesc 各種画面サイズ設定
 * @author とんび@鳶嶋工房
 *
 * @param screenWidth
 * @desc ゲーム画面全体の幅(本体設定: 816ピクセル)
 * @default 1280
 *
 * @param screenHeight
 * @desc ゲーム画面全体の高さ(本体設定: 624ピクセル)
 * @default 720
 * 
 * @param boxWidth
 * @desc ウィンドウ表示部分の幅(本体設定: 816ピクセル)
 * @default 1080
 *
 * @param boxHeight
 * @desc ウィンドウ表示部分の高さ(本体設定: 624ピクセル)
 * @default 720
 *
 * @help
 * 多分、screenWidth・screenHeight と boxWidth・boxHeight の値が違っていると
 * レイアウトが崩れる箇所が[名前入力の処理]などに残ってると思います。
 *
 * 利用規約 : MITライセンス
 */

( function() {
	'use strict';
	const PARAM_TRUE = 'true';

    /**
     * パラメータを受け取る
     */
	const pluginParams = PluginManager.parameters( 'TF_ScreenUtil' );
	// 画面周り
	const TF_screenWidth = parseIntStrict( pluginParams.screenWidth );
	const TF_screenHeight = parseIntStrict( pluginParams.screenHeight );
	const TF_boxWidth = parseIntStrict( pluginParams.boxWidth );
	const TF_boxHeight = parseIntStrict( pluginParams.boxHeight );

	/**
	 * 与えられた文字列に変数が指定されていたら、変数の内容に変換して返す。
	 * @param {String} value 変換元の文字列( v[n]形式を含む )
	 * @return {String} 変換後の文字列
	 */
	function treatValue( value ) {
		if( value === undefined || value === '' ) return '0';
		if( value[ 0 ] === 'V' || value[ 0 ] === 'v' ) {
			return value.replace( /[Vv]\[([0-9]+)\]/, ( match, p1 ) => $gameVariables.value( parseInt( p1, 10 ) ) );
		}
		return value;
	}

	/**
	 * @method parseIntStrict
	 * @param {String} value
	 * @return {Number} 数値に変換した結果
	 */
	function parseIntStrict( value ) {
		const result = parseInt( treatValue( value ), 10 );
		if( isNaN( result ) ) throw Error( '指定した値[' + value + ']が数値ではありません。' );
		return result;
	};

	/**
	 * @method parseFloatStrict
	 * @param {String} value
	 * @return {Number} 数値に変換した結果
	 */
	function parseFloatStrict( value ) {
		const result = parseFloat( treatValue( value ) );
		if( isNaN( result ) ) throw Error( '指定した値[' + value + ']が数値ではありません。' );
		return result;
	}


	/*==== 画面設定 ====*/
	/*--- SceneManager ---*/
	const _SceneManager_initialize = SceneManager.initialize;
	SceneManager.initialize = function() {
		this._screenWidth = TF_screenWidth;
		this._screenHeight = TF_screenHeight;
		this._boxWidth = TF_boxWidth;
		this._boxHeight = TF_boxHeight;
		_SceneManager_initialize.call( this );
	};

	/*--- WindowLayer ---*/
	/**
	 * コアスクリプトのバグ対応で、メソッドごと入れ替え
	 */
	WindowLayer.prototype._maskWindow = function( window, shift ) {
		this._windowMask._currentBounds = null;
		this._windowMask.boundsDirty = true;
		var rect = this._windowRect;
		rect.x = this.x + shift.x + window.x;
		rect.y = this.y + shift.y + window.y + window.height / 2 * ( 1 - window._openness / 255 );// this.y が this.x になっていた
		rect.width = window.width;
		rect.height = window.height * window._openness / 255;
	};

	/*--- Spriteset_Base ---*/
	/**
	 * コアスクリプトのバグ対応
	 */
	const _Spriteset_Base_createPictures = Spriteset_Base.prototype.createPictures;
	Spriteset_Base.prototype.createPictures = function() {
		_Spriteset_Base_createPictures.call( this );
		this._pictureContainer.setFrame( 0, 0, TF_screenWidth, TF_screenHeight );// 表示位置を原点に戻す
	};

	/*--- Scene_Title ---*/
	const _Scene_Title_start = Scene_Title.prototype.start;
	Scene_Title.prototype.start = function() {
		_Scene_Title_start.call( this );

		fitToScreen( this._backSprite1 );
		fitToScreen( this._backSprite2 );
	};

	/**
	* スプライトを画面いっぱいに拡大
	* @param {Sprite} sprite スプライト
	*/
	function fitToScreen( sprite ) {
		if( !sprite.bitmap || !sprite.bitmap.width ) return;

		const scaleX = Graphics.width / sprite.bitmap.width;
		const scaleY = Graphics.height / sprite.bitmap.height;
		if( 1 < scaleX ) sprite.scale.x = scaleX;
		if( 1 < scaleY ) sprite.scale.y = scaleY;
		centerSprite( sprite );
	}
	/**
	 * スプライトを画面中央に表示
	 * @param {Sprite} sprite スプライト
	 */
	function centerSprite( sprite ) {
		sprite.x = Graphics.width / 2;
		sprite.y = Graphics.height / 2;
		sprite.anchor.x = 0.5;
		sprite.anchor.y = 0.5;
	}


	/*--- Spriteset_Battle ---*/
	const TYPE_STAGE = 1;	// ステージ(地面)背景
	const TYPE_SET = 2;			// セット(建物)背景
	Spriteset_Battle.prototype.createBattleback = function() {
		this._back1Sprite = new Sprite_Battleback( this.battleback1Name(), TYPE_STAGE );
		this._back2Sprite = new Sprite_Battleback( this.battleback2Name(), TYPE_SET );
		fitToScreen( this._back1Sprite );
		fitToScreen( this._back2Sprite );
		this._battleField.addChild( this._back1Sprite );
		this._battleField.addChild( this._back2Sprite );
	};
	Spriteset_Battle.prototype.updateBattleback = function() { };


	/*--- Sprite_Battleback ---*/
	class Sprite_Battleback extends Sprite {
		constructor( bitmapName, type ) {
			super();
			this.bitmap = this.createBitmap( bitmapName, type );
		}

		/**
		 * 背景画像の生成・読み込み
		 */
		createBitmap( bitmapName, type ) {
			if( bitmapName === '' ) {
				return new Bitmap( Graphics.width, Graphics.height );
			} else if( type === TYPE_STAGE ) {
				return ImageManager.loadBattleback1( bitmapName );
			} else {
				return ImageManager.loadBattleback2( bitmapName );
			}
		}
	}


	/*--- Sprite_Enemy ---*/
	const DEFAULT_SCREEN_WIDTH = 816;
	const DEFAULT_SCREEN_HEIGHT = 624;
	/**
	 * 敵位置をスクリーンサイズに合わせて調整
	 */
	const _Sprite_Enemy_setBattler = Sprite_Enemy.prototype.setBattler;
	Sprite_Enemy.prototype.setBattler = function( battler ) {
		_Sprite_Enemy_setBattler.call( this, battler );

		if( !this._enemy._alteredScreenY ) {
			this._homeY += Math.floor( ( Graphics.height - DEFAULT_SCREEN_HEIGHT ) / 2 );
			this._enemy._screenY = this._homeY;
			this._enemy._alteredScreenY = true;
		}
		if( $gameSystem.isSideView() || this._enemy._alteredScreenX ) return;

		this._homeX += ( Graphics.width - DEFAULT_SCREEN_WIDTH ) / 2;
		this._enemy._screenX = this._homeX;
		this._enemy._alteredScreenX = true;
	};
} )();
