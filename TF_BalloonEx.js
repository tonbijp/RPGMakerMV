//========================================
// TF_BalloonEx.js
// Version :0.5.2.0
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
* @default ["{\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"6\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"8\"}","{\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"6\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"8\"}","{\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"6\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"8\"}","{\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"6\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"8\"}","{\"dx\":\"20\",\"dy\":\"40\",\"startPatterns\":\"0\",\"loopPatterns\":\"3\",\"endPatterns\":\"0\",\"loops\":\"4\",\"speed\":\"8\"}","{\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"6\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"8\"}","{\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"6\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"8\"}","{\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"6\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"8\"}","{\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"6\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"8\"}","{\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"6\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"8\"}","{\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"6\",\"endPatterns\":\"0\",\"loops\":\"0\",\"speed\":\"8\"}","{\"dx\":\"0\",\"dy\":\"60\",\"startPatterns\":\"5\",\"loopPatterns\":\"1\",\"endPatterns\":\"2\",\"loops\":\"6\",\"speed\":\"1\"}","{\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"6\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"8\"}","{\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"6\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"8\"}","{\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"6\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"8\"}","{\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"6\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"8\"}"]
*
*
* @help
* TF_START_BALLOON [イベントID] [フキダシID] [完了までウェイト] [dx] [dy]
*　フキダシの(ループ)アニメーションを開始。引数はすべて省略可能。
*　[イベントID] 0:このイベント、-1:プレイヤー、-2〜-4:隊列メンバー、1〜:イベントID(規定値:0)
*　[フキダシID] img/system/balloon.png の上から1〜15(規定値:11)
*　[完了までウェイト] 真偽値(true:フキダシのアニメーション終了まで待つ false:待たない)(規定値:false)
*　[dx] 表示位置のx差分。
*　[dy] 表示位置のy差分。
*
* TF_BALLOON_POSITION [イベントID] [dx] [dy]
*　フキダシ表示位置を変更。フキダシ表示中のみ可能。
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
 * @min -1000000
 * 
 * @param dy
 * @desc フキダシ表示座標のy差分。正の値で下に負の値で上にずれる。
 * @type Number
 * @default 0
 * @min 0
 * @min -1000000
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
 * @desc 消滅に使用するパターン数
 * @type Number
 * @default 0
 * @min 0
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
 * @min 1
 * 
 * 
 */

( function() {
	'use strict';
	const TF_START_BALLOON = 'TF_START_BALLOON';
	const TF_BALLOON_POSITION = 'TF_BALLOON_POSITION';
	const TF_STOP_BALLOON = 'TF_STOP_BALLOON';
	const WAIT_BALLOON = 'balloon';
	const PARAM_TRUE = 'true';
	const BALLOON_PHASE_LOOP = 'loop';
	const BALLOON_PHASE_END = 'end';
	const BALLOON_PHASE_WAIT = 'wait';

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
	 * @param {String} value
	 * @return {Number} 数値に変換した結果
	 */
	function parseIntStrict( value ) {
		if( value === undefined ) return 0;
		if( value[ 0 ] === 'V' ) {
			value = value.replace( /V\[([0-9]+)\]/, ( match, p1 ) => $gameVariables.value( parseInt( p1, 10 ) ) );
		}
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

	/**
	 * 
	 * @param {Game_CharacterBase} target 対象となるキャラ・イベント
	 * @param {Number} dx x差分
	 * @param {Number} dy y差分
	 */
	function setBalloonPosition( target, dx, dy ) {
		if( target.TF_balloon ) {
			target.TF_balloon.dx = parseIntStrict( dx );
			target.TF_balloon.dy = parseIntStrict( dy );
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
			this._character = getEventById( this, parseIntStrict( args[ 0 ] ) );

			if( this._character ) {
				this._character.requestBalloon( args[ 1 ] );
				if( args[ 2 ].toLowerCase() === PARAM_TRUE ) {
					this.setWaitMode( WAIT_BALLOON );
				}
				if( args[ 3 ] !== undefined ) {
					if( args[ 4 ] === undefined ) {
						this._character.TF_balloon.dx = parseIntStrict( args[ 3 ] );
					} else {
						setBalloonPosition( this._character, args[ 3 ], args[ 4 ] );
					}
				}
			}
		} else if( commandStr === TF_BALLOON_POSITION ) {
			const targetEvent = getEventById( this, parseIntStrict( args[ 0 ] ) );
			setBalloonPosition( targetEvent, args[ 1 ], args[ 2 ] );
		} else if( commandStr === TF_STOP_BALLOON ) {
			const targetEvent = getEventById( this, parseIntStrict( args[ 0 ] ) );
			targetEvent.TF_isPlay = false;
		}
	};

	/*--- Game_CharacterBase ---*/
	const _Game_CharacterBase_requestBalloon = Game_CharacterBase.prototype.requestBalloon;
	Game_CharacterBase.prototype.requestBalloon = function( balloonId ) {
		const iconIndex = parseIntStrict( balloonId ) - 1;
		this.TF_balloon = Object.assign( {}, pluginParams.preset[ iconIndex ] );// 参照渡しでなくコピー渡し
		this.TF_isPlay = true;
		_Game_CharacterBase_requestBalloon.apply( this, arguments );
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
		bs._duration = 8 * TFb.speed + bs.waitTime();
		bs.TF_loopStartDuration = ( 8 - TFb.startPatterns ) * TFb.speed + bs.waitTime();
		bs.TF_loopEndDuration = bs.TF_loopStartDuration - TFb.loopPatterns * TFb.speed;
		bs.TF_endDuration = bs.TF_loopEndDuration - TFb.endPatterns * TFb.speed;
		bs.TF_loops = TFb.loops;
		bs.TF_phase = BALLOON_PHASE_LOOP;
	};

	/**
	 * フキダシアイコンのアップデート。
	 */
	const _Sprite_Character_updateBalloon = Sprite_Character.prototype.updateBalloon;
	Sprite_Character.prototype.updateBalloon = function() {
		_Sprite_Character_updateBalloon.call( this );
		const bs = this._balloonSprite;
		if( !bs ) return;

		if( !this._character.TF_isPlay ) {
			// トリガがOFFになったら終了
			bs._duration = bs.TF_loopEndDuration;
			bs.TF_phase = BALLOON_PHASE_END;
			this._character.TF_isPlay = true;
		}
		const TFb = this._character.TF_balloon;
		bs.x += TFb.dx;
		bs.y += TFb.dy;
	};

	/*--- Sprite_Balloon ---*/
	const _Sprite_Balloon_update = Sprite_Balloon.prototype.update;
	Sprite_Balloon.prototype.update = function() {
		if( this.TF_phase === BALLOON_PHASE_LOOP && this._duration <= this.TF_loopEndDuration ) {
			if( this.TF_loops === 1 ) {
				this.TF_phase = BALLOON_PHASE_END;
			} else {
				// ループを行う
				if( 1 < this.TF_loops ) {
					this.TF_loops--;
				}
				this._duration = this.TF_loopStartDuration;
			};
		}
		if( this.TF_phase === BALLOON_PHASE_END && this._duration < this.TF_endDuration ) {
			this._duration = this.waitTime();
			this.TF_phase = BALLOON_PHASE_WAIT;
		}
		if( this.TF_phase === BALLOON_PHASE_WAIT && this._duration === 0 ) {
			this.TF_phase = '';
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
