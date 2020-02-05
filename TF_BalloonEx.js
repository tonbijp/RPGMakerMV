//========================================
// TF_BalloonEx.js
// Version :0.3.0.0
// For : RPGツクールMV (RPG Maker MV)
// -----------------------------------------------
// Copyright : Tobishima-Factory 2020
// Website : http://tonbi.jp
//
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//========================================
/*:ja
* @plugindesc [フキダシアイコンの表示]の拡張
* @author とんび@鳶嶋工房
*
* @param preset
* @desc フキダシのアニメーション設定
* @type struct<BalloonParam>[]
* @default ["{\"xDiff\":\"0\",\"yDiff\":\"0\",\"startNumber\":\"2\",\"loopPatterns\":\"6\",\"loopTimes\":\"1\",\"isWait\":\"false\"}","{\"xDiff\":\"0\",\"yDiff\":\"0\",\"startNumber\":\"2\",\"loopPatterns\":\"6\",\"loopTimes\":\"1\",\"isWait\":\"false\"}","{\"xDiff\":\"0\",\"yDiff\":\"0\",\"startNumber\":\"2\",\"loopPatterns\":\"6\",\"loopTimes\":\"1\",\"isWait\":\"false\"}"]
*
*
* @help
* TF_START_BALLOON [イベントID] [フキダシID] [完了までウェイト]
*　フキダシの(ループ)アニメーションを開始。
*　[イベントID] 0:このイベント、-1:プレイヤー、-2〜-4:隊列メンバー、1〜:イベントID(規定値:0)
*　[フキダシID] img/system/balloon.png の上から1〜15(規定値:11)
*　[完了までウェイト] 真偽値(true:フキダシのアニメーション終了まで待つ false:待たない)(規定値:false)
*
* TF_STOP_BALLOON [イベントID]
*　フキダシのアニメーションを停止。
*　TF_startBalloon で[ループ回数] 0 を指定した場合など、これを使って止める。
*
*/

/*~struct~BalloonParam:
 *
 * @param dx
 * @desc フキダシ表示座標のx差分。正の値で右に負の値で左にずれる。
 * @type Number
 * @default 0
 * @min 0
 * 
 * @param dy
 * @desc フキダシ表示座標のy差分。正の値で下に負の値で上にずれる。
 * @type Number
 * @default 0
 * @min 0
 *
 * @param startPatterns
 * @desc 出現に使用するパターン数。
 * @type Number
 * @default 2
 * @min 0
 * @max 7
 *
 * @param loopPatterns
 * @desc ループに使用するパターン数。
 * @type Number
 * @default 6
 * @min 0
 * @max 8
 * 
 * @param endPatterns
 * @desc 消滅に使用するパターン数(-1:出現パターンを逆再生)
 * @type Number
 * @default 0
 * @min -1
 * @max 7
 *
 * @param loops
 * @desc ループ回数(0:TF_STOP_BALLOONを実行するまでループ)
 * @type Number
 * @default 1
 * @min 0
 *
 * @param speed
 * @desc パターンの表示時間(フレーム)
 * @type Number
 * @default 8
 * @min 0
 * 
 * 
 */

( function() {
	'use strict';
	const TF_START_BALLOON = 'TF_START_BALLOON';
	const TF_STOP_BALLOON = 'TF_STOP_BALLOON';
	const WAIT_BALLOON = 'balloon';
	const PARAM_TRUE = 'true';

    /**
     * パラメータを受け取る
     */
	const pluginParams = PluginManager.parameters( 'TF_BalloonEx' );
	const presetList = JsonEx.parse( pluginParams.preset );
	pluginParams.preset = presetList.map( value => {
		const params = JsonEx.parse( value );
		params.dx = parseIntStrict( params.dx );
		params.dy = parseIntStrict( params.dy );
		params.startPatterns = parseIntStrict( params.startPatterns );
		params.loopPatterns = parseIntStrict( params.loopPatterns );
		params.endPatterns = parseIntStrict( params.endPatterns );
		params.loops = parseIntStrict( params.loops );
		params.speed = parseIntStrict( params.speed );

		return params;
	} );


	/**
	 * @method parseIntStrict
	 * @param {Number} value
	 * @type Number
	 * @return {Number} 数値に変換した結果
	 */
	function parseIntStrict( value ) {
		if( value === undefined ) return 0;
		const result = parseInt( value, 10 );
		if( isNaN( result ) ) throw Error( '指定した値[' + value + ']が数値ではありません。' );
		return result;
	};

	/**
	 * character を拡張して隊列メンバーも指定できるようにしたもの。
	 * @param {Game_Interpreter} interpreter インタプリタ
	 * @param {Number} id 拡張イベントID
	 * @returns {Game_CharacterBase}
	 */
	function getEventById( interpreter, id ) {
		if( id < -1 ) {
			return $gamePlayer.followers().follower( -2 - id );			// 隊列メンバー(0〜2)
		} else {
			return interpreter.character( id );			// プレイヤーキャラおよびイベント
		}
	}

	/*---- Game_Interpreter ----*/
    /**
     * プラグインコマンドの実行
     */
	const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function( command, args ) {
		_Game_Interpreter_pluginCommand.apply( this, arguments );

		const commandStr = command.toUpperCase();
		if( commandStr === TF_START_BALLOON ) {
			const eventId = parseIntStrict( args[ 0 ] );
			this._character = getEventById( this, eventId );

			const iconId = parseIntStrict( args[ 1 ] );
			this._character.TF_balloon = pluginParams.preset[ iconId - 1 ];
			this._character.TF_isPlay = true;

			if( this._character ) {
				this._character.requestBalloon( args[ 1 ] );
				if( args[ 2 ].toLowerCase() === PARAM_TRUE ) {
					this.setWaitMode( WAIT_BALLOON );
				}
			}
			return true;
		} else if( commandStr === TF_STOP_BALLOON ) {
			const targetEvent = getEventById( this, parseIntStrict( args[ 0 ] ) );
			targetEvent.TF_isPlay = false;
		}
	};


	// Show Balloon Icon
	const _Game_Interpreter_command213 = Game_Interpreter.prototype.command213;
	Game_Interpreter.prototype.command213 = function() {
		const eventId = parseIntStrict( this._params[ 0 ] );
		this._character = getEventById( this, eventId );

		const iconId = parseIntStrict( this._params[ 1 ] );
		this._character.TF_balloon = pluginParams.preset[ iconId - 1 ];
		this._character.TF_isPlay = true;

		return _Game_Interpreter_command213.call( this );
	};

	/*--- Sprite_Character ---*/
	/**
	 * フキダシアイコンの表示開始。
	 */
	const _Sprite_Character_startBalloon = Sprite_Character.prototype.startBalloon;
	Sprite_Character.prototype.startBalloon = function() {
		_Sprite_Character_startBalloon.call( this );

		const bs = this._balloonSprite;
		const TFb = this._character.TF_balloon;

		bs.TF_speed = TFb.speed;
		bs._duration = 8 * TFb.speed + bs.waitTime();		// speedが反映されていないので開始時の残りフレームを上書き
		bs.TF_loopStartDuration = ( 8 - TFb.startPatterns ) * TFb.speed + bs.waitTime();
		bs.TF_loopEndDuration = bs.TF_loopStartDuration - TFb.loopPatterns * TFb.speed;
		bs.TF_endDuration = bs.TF_loopEndDuration - TFb.endPatterns * TFb.speed;
		bs.TF_loops = TFb.loops;
		bs.TF_phase = 'loop';

	};

	/**
	 * フキダシアイコンのアップデート。
	 */
	const _Sprite_Character_updateBalloon = Sprite_Character.prototype.updateBalloon;
	Sprite_Character.prototype.updateBalloon = function() {
		_Sprite_Character_updateBalloon.call( this );
		const bs = this._balloonSprite;
		if( bs ) {
			if( !this._character.TF_isPlay ) {
				// トリガがOFFになったら終了
				bs._duration = 0;
				bs.TF_phase = 'end';
			}
			const TFb = this._character.TF_balloon;
			bs.x += TFb.dx;
			bs.y += TFb.dy;
		}
	};

	/*--- Sprite_Balloon ---*/
	const _Sprite_Balloon_update = Sprite_Balloon.prototype.update;
	Sprite_Balloon.prototype.update = function() {
		if( this.TF_phase === 'loop' && this._duration < this.TF_loopEndDuration ) {
			if( this.TF_loops === 1 ) {
				this._duration = this.waitTime();
				this.TF_phase = 'end';
			} else {
				// ループを行う
				if( 1 < this.TF_loops ) {
					this.TF_loops--;
				}
				this._duration = this.TF_loopStartDuration;
			};
		}
		_Sprite_Balloon_update.call( this );
	};
	/**
	 * パターン表示の継続フレーム数を返す。
	 */
	Sprite_Balloon.prototype.speed = function() {
		return this.TF_speed;
	}
} )();
