//========================================
// TF_BalloonEx.js
// Version :0.7.1.0
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
 *
 * TF_START_BALLOON [イベントID] [フキダシID] [完了までウェイト] [dx] [dy]
 *　フキダシの(ループ)アニメーションを開始。引数はすべて省略可能。
 *　[イベントID] 0:このイベント、-1:プレイヤー、-2〜-4:隊列メンバー、1〜:イベントID(規定値:0)
 *　[フキダシID] img/system/balloon.png の上から1〜15(規定値:11)
 *　[完了までウェイト] 真偽値(true:フキダシのアニメーション終了まで待つ false:待たない)(規定値:false)
 *　[dx] 表示位置のx差分(規定値:プラグインパラメータでdxに設定した値)
 *　[dy] 表示位置のy差分(規定値:プラグインパラメータでdyに設定した値)
 *
 * TF_POSITION_BALLOON [イベントID] [dx] [dy]
 *　フキダシ表示位置を変更。フキダシ表示中のみ可能。
 *
 * TF_STOP_BALLOON [イベントID]
 *　フキダシのアニメーションを停止。
 *　TF_START_BALLOON で[ループ回数] 0 を指定した場合など、これを使って止める。
 *
 * [イベントID][フキダシID][dx][dy]の数値は全てV[n]の形式で、変数を指定できます。
 * 例 : TF_POSITION_BALLOON 0 V[1] V[2]
 *
 * 【[移動ルートの設定]で使えるスクリプト】
 * this.TF_startBalloon( [フキダシID], [完了までウエイト], [dx], [dy] ); // TF_START_BALLOONの機能
 *
 * ※ [完了までウエイト], [dx], [dy] は省略できます。規定値は TF_START_BALLOON に準拠します。
 * ※ this.TF_startBalloon の代わりに this.balloon も使えます。
 * 　 ただし EventEffects.js と併用の際は EventEffects.js を、このプラグインの上に配置してください。
 *
 * this.TF_positionBalloon( [dx], [dy] ); // TF_POSITION_BALLOONの機能
 * this.TF_stopBalloon(); // TF_STOP_BALLOON の機能
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
	const TF_POSITION_BALLOON = 'TF_POSITION_BALLOON';
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
		if( value[ 0 ] === 'V' || value[ 0 ] === 'v' ) {
			value = value.replace( /[Vv]\[([0-9]+)\]/, ( match, p1 ) => $gameVariables.value( parseInt( p1, 10 ) ) );
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
			if( dx !== undefined ) {
				target.TF_balloon.dx = parseIntStrict( dx );
			}
			if( dy !== undefined ) {
				target.TF_balloon.dy = parseIntStrict( dy );
			}
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
				this._character.TF_balloon = null;
				this._character.requestBalloon( args[ 1 ] );
				if( args[ 2 ] && args[ 2 ].toLowerCase() === PARAM_TRUE ) {
					this.setWaitMode( WAIT_BALLOON );
				}
				setBalloonPosition( this._character, args[ 3 ], args[ 4 ] );
			}
		} else if( commandStr === TF_POSITION_BALLOON ) {
			const targetEvent = getEventById( this, parseIntStrict( args[ 0 ] ) );
			setBalloonPosition( targetEvent, args[ 1 ], args[ 2 ] );
		} else if( commandStr === TF_STOP_BALLOON ) {
			const targetEvent = getEventById( this, parseIntStrict( args[ 0 ] ) );
			if( targetEvent.TF_balloon ) {
				targetEvent.TF_balloon.finishTrigger = true;
			}
		}
	};

	/**
	 * フキダシを新規に生成すると判断できるように、TF_balloon を空にして呼び出す。
	 */
	const _Game_Interpreter_command213 = Game_Interpreter.prototype.command213;
	Game_Interpreter.prototype.command213 = function() {
		const target = this.character( this._params[ 0 ] );
		if( target ) {
			target.TF_balloon = null;
		}
		return _Game_Interpreter_command213.call( this );
	};

	/*--- Game_CharacterBase ---*/
	const _Game_CharacterBase_requestBalloon = Game_CharacterBase.prototype.requestBalloon;
	Game_CharacterBase.prototype.requestBalloon = function( balloonId ) {
		const iconIndex = parseIntStrict( balloonId );
		if( !this.TF_balloon ) {
			this.TF_balloon = Object.assign( {}, pluginParams.preset[ iconIndex - 1 ] );// 参照渡しでなくコピー渡し
			this.TF_balloon.finishTrigger = false;
		}
		_Game_CharacterBase_requestBalloon.call( this, iconIndex );
	};

	/**
	 * EventEffects.js の機能を上書きして、dx, dy を追加。
	 */
	Game_CharacterBase.prototype.balloon = function( num, wait, dx, dy ) {
		return Game_CharacterBase.prototype.TF_startBalloon.apply( this, arguments );
	};
	Game_CharacterBase.prototype.TF_startBalloon = function( num, wait, dx, dy ) {
		this.TF_balloon = null;
		this.requestBalloon( num );
		if( wait ) {
			this.currentInterpreter().setWaitMode( WAIT_BALLOON );
		}
		setBalloonPosition( this, dx, dy );
		return true;
	};
	Game_CharacterBase.prototype.TF_positionBalloon = function( dx, dy ) {
		setBalloonPosition( this, dx, dy );
	};
	Game_CharacterBase.prototype.TF_stopBalloon = function() {
		if( this.TF_balloon ) {
			this.TF_balloon.finishTrigger = true;
		}
	};


	/*--- Sprite_Character ---*/
	/**
	 * 初期化時にフキダシデータがあったら復帰。
	 */
	const _Sprite_Character_initialize = Sprite_Character.prototype.initialize;
	Sprite_Character.prototype.initialize = function( character ) {
		_Sprite_Character_initialize.apply( this, arguments );

		if( this._character.TF_balloon ) {
			this._character.requestBalloon( this._character.TF_balloon._balloonId );
		}
	}

	const _Sprite_Character_endBalloon = Sprite_Character.prototype.endBalloon;
	Sprite_Character.prototype.endBalloon = function() {
		if( this._balloonSprite ) {
			this._character.TF_balloon = null;
		}
		_Sprite_Character_endBalloon.call( this );
	};

	/**
	 * フキダシアイコンの表示開始。
	 */
	const _Sprite_Character_startBalloon = Sprite_Character.prototype.startBalloon;
	Sprite_Character.prototype.startBalloon = function() {
		const TFb = this._character.TF_balloon;

		if( TFb._balloonId ) {
			// 復帰
			if( !this._balloonSprite ) {
				this._balloonSprite = new Sprite_Balloon();
			}
			this._balloonSprite._balloonId = TFb._balloonId;
			this.parent.addChild( this._balloonSprite );
		} else {
			// 生成
			_Sprite_Character_startBalloon.call( this );
			TFb._duration = 8 * TFb.speed + this._balloonSprite.waitTime();
			TFb.loopStartDuration = TFb._duration - TFb.startPatterns * TFb.speed;
			TFb.loopEndDuration = TFb.loopStartDuration - TFb.loopPatterns * TFb.speed;
			TFb.endDuration = TFb.loopEndDuration - TFb.endPatterns * TFb.speed;
			TFb.phase = BALLOON_PHASE_LOOP;
			TFb._balloonId = this._character.balloonId();	//復帰用に保存
		}

		this._balloonSprite.TF_balloon = TFb;	// Game_CharacterBase のフキダシデータへの参照を渡す
		this._balloonSprite._duration = TFb._duration;	// speedを反映させたので上書き
	};

	/**
	 * フキダシアイコンのアップデート。
	 */
	const _Sprite_Character_updateBalloon = Sprite_Character.prototype.updateBalloon;
	Sprite_Character.prototype.updateBalloon = function() {
		_Sprite_Character_updateBalloon.call( this );
		const bs = this._balloonSprite;
		if( !bs ) return;

		const TFb = this._character.TF_balloon;
		if( TFb.finishTrigger ) {
			bs._duration = TFb.loopEndDuration;
			TFb.phase = BALLOON_PHASE_END;
			TFb.finishTrigger = false;
		}
		bs.x += TFb.dx;
		bs.y += TFb.dy;
	};

	/*--- Sprite_Balloon ---*/
	const _Sprite_Balloon_update = Sprite_Balloon.prototype.update;
	Sprite_Balloon.prototype.update = function() {
		const TFb = this.TF_balloon;
		TFb._duration = this._duration;		// Game_CharacterBase への保存

		if( TFb.phase === BALLOON_PHASE_LOOP && this._duration <= TFb.loopEndDuration ) {
			if( TFb.loops === 1 ) {
				TFb.phase = BALLOON_PHASE_END;
			} else {
				// ループを行う
				if( 1 < TFb.loops ) {
					TFb.loops--;
				}
				this._duration = TFb.loopStartDuration;
			};
		}

		if( TFb.phase === BALLOON_PHASE_END && this._duration < this.endDuration ) {
			this._duration = this.waitTime();
			TFb.phase = BALLOON_PHASE_WAIT;
		}

		if( TFb.phase === BALLOON_PHASE_WAIT && this._duration === 0 ) {
			TFb.phase = '';
		}

		_Sprite_Balloon_update.call( this );
	};
	/**
	 * パターン表示の継続フレーム数を返す。
	 */
	Sprite_Balloon.prototype.speed = function() {
		if( this.TF_balloon ) {
			return this.TF_balloon.speed;
		} else {
			return 8;	//すぐに上書きするので、これはダミー値
		}
	}
} )();
