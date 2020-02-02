//========================================
// TF_BalloonEx.js
// Version :0.1.0.1
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
* @help
* TF_START_BALLOON [イベントID] [フキダシID] [完了までウェイト] [y差分] [パターン数] [ループ回数]
*　フキダシの(ループ)アニメーションを開始。
*　[イベントID] 0:このイベント、-1:プレイヤー、-2〜-4:隊列メンバー、1〜:イベントID(規定値:0)
*　[フキダシID] img/system/balloon.png の上から1〜15(規定値:11)
*　[完了までウェイト] 真偽値(true:フキダシのアニメーション終了まで待つ false:待たない)(規定値:false)
*　[y差分] フキダシ表示座標の差分。正の値で下に負の値で上にずれる(規定値:0)
*　[パターン数]はループに使用するパターンの数。1〜8(規定値:0)
*　[ループ回数] 0:TF_stopBalloonを実行するまでループ。(規定値:1)
*
* TF_STOP_BALLOON [イベントID]
*　フキダシのアニメーションを停止。
*　TF_startBalloon で[ループ回数] 0 を指定した場合など、これを使って止める。
*/

( function() {
	'use strict';
	const PLUGIN_NAME = 'TF_BalloonEx';
	const TF_START_BALLOON = 'TF_START_BALLOON';
	const TF_STOP_BALLOON = 'TF_STOP_BALLOON';
	const WAIT_BALLOON = 'balloon';
	const PARAM_TRUE = 'true';

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
			return $gamePlayer.followers().follower( -id );			// 隊列メンバー
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
			this._character = getEventById( this, parseIntStrict( args[ 0 ] ) );
			this._character.TF_balloonIsPlay = true;
			this._character.TF_balloonDy = parseIntStrict( args[ 3 ] );
			this._character.TF_balloonPatterns = parseIntStrict( args[ 4 ] );
			this._character.TF_balloonLoops = ( args[ 5 ] === undefined ) ? 1 : parseIntStrict( args[ 5 ] );

			const iconId = ( args[ 1 ] === undefined ) ? 11 : parseIntStrict( args[ 1 ] );
			this._character.requestBalloon( iconId );

			if( args[ 2 ] !== undefined && args[ 2 ].toLowerCase() === PARAM_TRUE ) {
				this.setWaitMode( WAIT_BALLOON );
			}
		} else if( commandStr === TF_STOP_BALLOON ) {
			const targetEvent = getEventById( this, parseIntStrict( args[ 0 ] ) );
			targetEvent.TF_balloonIsPlay = false;
		}
	};

	/*--- Sprite_Character ---*/
	const _Sprite_Character_startBalloon = Sprite_Character.prototype.startBalloon;
	Sprite_Character.prototype.startBalloon = function() {
		_Sprite_Character_startBalloon.call( this );
		const c = this._character;
		this.TF_balloonDy = ( c.TF_balloonDy === undefined ) ? 0 : c.TF_balloonDy;
		this._balloonSprite.TF_pattern = ( c.TF_balloonPatterns ) ? c.TF_balloonPatterns : 0;
		this._balloonSprite.TF_loops = ( c.TF_balloonLoops ) ? c.TF_balloonLoops : 0;
	};
	const _Sprite_Character_updateBalloon = Sprite_Character.prototype.updateBalloon;
	Sprite_Character.prototype.updateBalloon = function() {
		_Sprite_Character_updateBalloon.call( this );
		if( this._balloonSprite ) {
			if( !this._character.TF_balloonIsPlay ) {
				this._balloonSprite._duration = 0;
				this._balloonSprite.TF_pattern = 0;
			}
			this._balloonSprite.y += this.TF_balloonDy;
		}
	};

	/*--- Sprite_Balloon ---*/
	const _Sprite_Balloon_update = Sprite_Balloon.prototype.update;
	Sprite_Balloon.prototype.update = function() {
		if( this.TF_pattern && this._duration < this.waitTime() ) {
			if( this.TF_loops === 1 ) {
				this.TF_pattern = 0;	// ループ終了(waitTimeに入る)
			} else {
				if( 1 < this.TF_loops ) {
					this.TF_loops--;
				}
				this._duration = this.TF_pattern * this.speed() + this.waitTime()
			};
		}
		_Sprite_Balloon_update.call( this );
	};
} )();
