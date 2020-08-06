//========================================
// TF_BalloonEx.js
// Version :1.2.0.3
// For : RPGツクールMV (RPG Maker MV)
// -----------------------------------------------
// Copyright : Tobishima-Factory 2020
// Website : http://tonbi.jp
//
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//========================================
/*:
 * @plugindesc [Display balloon icon] extension
 * @author Tobishima-Factory
 *
 * @param preset
 * @desc The presets of balloon animation.
 * @type struct<BalloonParam>[]
 * @default ["{\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"6\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"8\",\"waitTime\":\"12\"}","{\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"6\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"8\",\"waitTime\":\"12\"}","{\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"6\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"8\",\"waitTime\":\"12\"}","{\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"6\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"8\",\"waitTime\":\"12\"}","{\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"6\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"8\",\"waitTime\":\"12\"}","{\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"6\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"8\",\"waitTime\":\"12\"}","{\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"6\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"8\",\"waitTime\":\"12\"}","{\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"6\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"8\",\"waitTime\":\"12\"}","{\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"6\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"8\",\"waitTime\":\"12\"}","{\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"6\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"8\",\"waitTime\":\"12\"}","{\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"6\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"8\",\"waitTime\":\"12\"}","{\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"6\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"8\",\"waitTime\":\"12\"}","{\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"6\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"8\",\"waitTime\":\"12\"}","{\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"6\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"8\",\"waitTime\":\"12\"}","{\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"6\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"8\",\"waitTime\":\"12\"}"]
 * 
 * @param baseDy
 * @desc The base difference y coordinate for a balloon.
 * @type Number
 * @default 0
 * 
 *
 * @help
 * ● Basic usage
 * 		Write the settings to each [Balloon ID] of the plug-in parameter "preset".
 * 　・You can edit the settings for dx, dy, loops, speed, waitTime.
 * 　・Summation of startPatterns, loopPatterns and endPatterns must under or equal 8.
 * 　・For details on the values to be set in parameter "preset", refer to the help text for entering each value.
 * 　Now, You execute [Display balloon icon] event command, The animation is played back with the settings according to [Balloon ID].
 * 　When combined with Triacontan's BalloonPlaySe.js, the sound can be played automatically, which is convenient.
 *
 * 
 * ● Plug-in command
 *------------------------------
 * TF_START_BALLOON [Event ID] [Balloon ID] [Wait for finish] [dx] [dy]
 * 　Start a balloon animation.All parameters can omitted.
 * 　[Event ID] 0:This event  -1:Player  -2〜-4:Member 1〜:Event ID (Default:0)
 * 　　You can use this, player,follower0,follower1,follower2 instead of the number.
 * 　　And [name] of the event. ( But can't use the name about like identifier of 'this', includes space, and number )
 * 　[Balloon ID] 1 to 15 counting from the top of the image( img/system/balloon.png ). (Default:11)
 * 　　And [name] of the balloon( set at plugin property ).
 * 　[Wait for finish] true:Wait for finish  false:Don't stop (Default:false)
 * 　[dx] Difference x coordinate. (Default:dx at plug-in parameter)
 * 　[dy] Difference y coordinate. (Default:dy at plug-in parameter)
 * 
 * 　EX: TF_START_BALLOON -1 5 false 0 20
 *------------------------------
 * TF_SET_BALLOON [Event ID] [Balloon ID] [Pattern Number] [Wait time] [Wait for finish] [dx] [dy]
 * 　[Pattern Number] 1 to 8 patterns from the left of the balloon image. (Default:8)
 * 　[Wait time] The number of frames to display the balloon( 0:Loop until TF STOP BALLOON is executed ). (Default:64)
 * 
 * 　EX: TF_SET_BALLOON 0 9 2 60 true 10 -50
 *------------------------------
 * TF_LOCATE_BALLOON [Event ID] [dx] [dy]
 * 　Locate ballon position. Apply to displayed balloon.
 * 
 * 　EX: TF_LOCATE_BALLOON 15 0 10
 *------------------------------
 * TF_STOP_BALLOON [Event ID] [Show end animation]
 * 　Stop balloon animation.
 * 　When executing TF_START_BALLOON specifying the preset [Loop] to 0.
 * 　[Show end animation] true:Show end animation  false:Immediately (Default:false)
 * 
 * 　EX: TF_STOP_BALLOON 0 true
 *------------------------------
 * All of the numbers of [Event ID][Balloon ID][dx][dy] can set format V[n]. That means variables.
 * 
 * 　EX : TF_LOCATE_BALLOON 0 V[1] V[2]
 *------------------------------
 * 
 * 
 * ● Scripts for [route settings]
 *------------------------------
 * this.TF_startBalloon( [Balloon ID], [Wait for finish], [dx], [dy] );
 * 　The function of  TF_START_BALLOON.
 * 　[Wait for finish], [dx], [dy] can omitted.Default values are confirmed on TF_START_BALLOON.
 * 　this.balloon is same syntax of this.TF_startBalloon.
 * 　If you use EventEffects.js, Place EventEffects.js over this plug-in.
 *------------------------------
 * this.TF_setBalloon( [Balloon ID], [Pattern Number], [Wait time], [Wait for finish], [dx], [dy] );
 * 　The function of TF_SET_BALLOON.
 *------------------------------
 * this.TF_locateBalloon( [dx], [dy] );
 * 　The function of  TF_LOCATE_BALLOON.
 *------------------------------
 * this.TF_stopBalloon( [Show end animation] );
 * 　The function of  TF_STOP_BALLOON .
 *------------------------------
 *
 * Released under the MIT License.
 */
/*~struct~BalloonParam:
 *
 * @param name
 * @desc  use for [Balloon ID]
 * @type String
 * @default ''
 *
 * @param dx
 * @desc difference x coordinate.
 * @type Number
 * @default 0
 * @min -1000000
 *
 * @param dy
 * @desc difference y coordinate.
 * @type Number
 * @default 0
 * @min 0
 * @min -1000000
 *
 * @param startPatterns
 * @desc The number of appearance patterns.
 * @type Number
 * @default 2
 * @min 0
 * @max 7
 *
 * @param loopPatterns
 * @desc The number of loop patterns.
 * @type Number
 * @default 6
 * @min 0
 * @max 8
 *
 * @param endPatterns
 * @desc The number of disappearance patterns.
 * @type Number
 * @default 0
 * @min 0
 * @max 7
 *
 * @param loops
 * @desc The number of loops.(0:Loop until TF STOP BALLOON is executed)
 * @type Number
 * @default 1
 * @min 0
 *
 * @param speed
 * @desc Duration of the pattern.(frame)
 * @type Number
 * @default 8
 * @min 0
 *
 * @param waitTime
 * @desc Duration of the last pattern.(frame)
 * @type Number
 * @default 12
 * @min 0
 */

/*:ja
 * @plugindesc [フキダシアイコンの表示]の拡張
 * @author とんび@鳶嶋工房
 *
 * @param preset
 * @desc フキダシのアニメーション設定
 * @type struct<BalloonParamJa>[]
 * @default ["{\"name\":\"びっくり\",\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"0\",\"loopPatterns\":\"7\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"4\",\"waitTime\":\"24\"}","{\"name\":\"はてな\",\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"0\",\"loopPatterns\":\"8\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"4\",\"waitTime\":\"24\"}","{\"name\":\"音符\",\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"0\",\"loopPatterns\":\"8\",\"endPatterns\":\"0\",\"loops\":\"2\",\"speed\":\"4\",\"waitTime\":\"12\"}","{\"name\":\"ハート\",\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"4\",\"loopPatterns\":\"4\",\"endPatterns\":\"0\",\"loops\":\"3\",\"speed\":\"8\",\"waitTime\":\"12\"}","{\"name\":\"怒り\",\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"1\",\"loopPatterns\":\"3\",\"endPatterns\":\"0\",\"loops\":\"4\",\"speed\":\"8\",\"waitTime\":\"12\"}","{\"name\":\"汗\",\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"0\",\"loopPatterns\":\"8\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"8\",\"waitTime\":\"32\"}","{\"name\":\"くしゃくしゃ\",\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"1\",\"loopPatterns\":\"3\",\"endPatterns\":\"0\",\"loops\":\"3\",\"speed\":\"8\",\"waitTime\":\"0\"}","{\"name\":\"沈黙\",\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"1\",\"loopPatterns\":\"3\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"12\",\"waitTime\":\"48\"}","{\"name\":\"電球\",\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"3\",\"endPatterns\":\"0\",\"loops\":\"2\",\"speed\":\"8\",\"waitTime\":\"12\"}","{\"name\":\"Zzz\",\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"0\",\"loopPatterns\":\"6\",\"endPatterns\":\"0\",\"loops\":\"2\",\"speed\":\"10\",\"waitTime\":\"12\"}","{\"name\":\"星\",\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"6\",\"endPatterns\":\"0\",\"loops\":\"0\",\"speed\":\"8\",\"waitTime\":\"12\"}","{\"name\":\"はてな複数\",\"dx\":\"18\",\"dy\":\"15\",\"startPatterns\":\"5\",\"loopPatterns\":\"3\",\"endPatterns\":\"0\",\"loops\":\"4\",\"speed\":\"8\",\"waitTime\":\"12\"}","{\"name\":\"音符複数\",\"dx\":\"20\",\"dy\":\"0\",\"startPatterns\":\"3\",\"loopPatterns\":\"5\",\"endPatterns\":\"0\",\"loops\":\"0\",\"speed\":\"8\",\"waitTime\":\"12\"}","{\"name\":\"ハート複数\",\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"3\",\"loopPatterns\":\"5\",\"endPatterns\":\"0\",\"loops\":\"0\",\"speed\":\"8\",\"waitTime\":\"12\"}","{\"name\":\"ユゲダシ\",\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"5\",\"endPatterns\":\"0\",\"loops\":\"4\",\"speed\":\"8\",\"waitTime\":\"12\"}","{\"name\":\"汗複数\",\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"3\",\"loopPatterns\":\"3\",\"endPatterns\":\"1\",\"loops\":\"4\",\"speed\":\"8\",\"waitTime\":\"12\"}","{\"name\":\"がやがや\",\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"2\",\"loopPatterns\":\"3\",\"endPatterns\":\"2\",\"loops\":\"4\",\"speed\":\"8\",\"waitTime\":\"0\"}","{\"name\":\"きゃっきゃ\",\"dx\":\"20\",\"dy\":\"5\",\"startPatterns\":\"3\",\"loopPatterns\":\"2\",\"endPatterns\":\"3\",\"loops\":\"40\",\"speed\":\"8\",\"waitTime\":\"0\"}","{\"name\":\"ヒットマーク\",\"dx\":\"0\",\"dy\":\"40\",\"startPatterns\":\"5\",\"loopPatterns\":\"1\",\"endPatterns\":\"2\",\"loops\":\"5\",\"speed\":\"1\",\"waitTime\":\"0\"}","{\"name\":\"カウントダウン\",\"dx\":\"0\",\"dy\":\"0\",\"startPatterns\":\"5\",\"loopPatterns\":\"0\",\"endPatterns\":\"0\",\"loops\":\"1\",\"speed\":\"60\",\"waitTime\":\"0\"}"]
 * @param baseDy
 * @desc フキダシの基本y座標差分
 * @type Number
 * @default 0
 * 
 *
 * @help
 * ●基本的な使い方
 * 　プラグインのパラメータの preset に[フキダシID]毎に設定を書きます。
 * 　・配置(dx,dy) ループ回数(loops) 速度(speed) 終了時間(waitTime)など設定。
 * 　・パターン数(startPatterns, loopPatterns,endPatterns)は計8以内。
 * 　・presetに設定する値について詳細は、それぞれのヘルプ文を参照ください。
 * 　通常の[フキダシアイコンの表示]イベントコマンドを実行すると、
 * 　[フキダシID]に応じた設定でアニメが再生されます。
 * 　トリアコンタンさんの BalloonPlaySe.js と組み合わせると音も鳴らせます。
 *
 * 
 * ●プラグインコマンド
 *------------------------------
 * TF_START_BALLOON [イベントID] [フキダシID] [完了までウェイト] [dx] [dy]
 * 　フキダシの(ループ)アニメーションを開始。引数はすべて省略可能。
 * 　[イベントID] 0:このイベント、-1:プレイヤー、-2〜-4:隊列メンバー
 * 　　1〜:イベントID(規定値:0)、this:このイベント、player:プレイヤー
 * 　　follower0:隊列メンバー0、follower1:隊列メンバー1、follower2:隊列メンバー2
 * 　　イベントの[名前]で指定(上記の数値や this などと同じ名前、
 * 　　およびスペースの入った名前は指定できません)
 * 　[フキダシID] img/system/balloon.png の上から1〜15(規定値:11)
 * 　　または、nameプロパティで設定した値を指定する。
 * 　[完了までウェイト] 真偽値
 * 　　(true:フキダシのアニメーション終了まで待つ false:待たない)(規定値:false)
 * 　[dx] 表示位置のx差分(規定値:プラグインパラメータでdxに設定した値)
 * 　[dy] 表示位置のy差分(規定値:プラグインパラメータでdyに設定した値)
 * 
 * 　例: TF_START_BALLOON -1 5 false 0 20
 *------------------------------
 * TF_SET_BALLOON [イベントID] [フキダシID] [パターン番号] [表示フレーム数] [完了までウェイト] [dx] [dy]
 * 　[パターン番号] フキダシ画像の左から 1〜8 のパターン(規定値:8)
 * 　[表示フレーム数] 表示するフレーム数
 * 　　(0:TF_STOP_BALLOONを実行するまでループ)(規定値:64フレーム)
 * 
 * 　例: TF_SET_BALLOON 0 9 2 60 true 10 -50
 *------------------------------
 * TF_LOCATE_BALLOON [イベントID] [dx] [dy]
 * 　フキダシ表示位置を変更。フキダシ表示中のみ可能。
 * 
 * 　例: TF_LOCATE_BALLOON 15 0 10
 *------------------------------
 * TF_STOP_BALLOON [イベントID] [消滅アニメを表示]
 * 　フキダシのアニメーションを停止。
 * 　TF_START_BALLOON で[ループ回数] 0 の場合など、これを使って止める。
 * 　[消滅アニメを表示] 真偽値(true:消滅アニメを表示 false:即終了)(規定値:false)
 * 
 * 　例: TF_STOP_BALLOON 0 true
 *------------------------------
 * [イベントID][フキダシID][dx][dy]の数値は全てV[n]で変数を指定できます。
 * 
 * 例 : TF_LOCATE_BALLOON 0 V[1] V[2]
 *------------------------------
 *
 * 
 * ● [移動ルートの設定]で使えるスクリプト
 * 
 * this.TF_startBalloon( [フキダシID], [完了までウエイト], [dx], [dy] );
 * 　TF_START_BALLOONの機能
 * 　[完了までウエイト], [dx], [dy] は省略できます。
 * 　　規定値は TF_START_BALLOON に準拠します。
 * 　this.TF_startBalloon の代わりに this.balloon も使えます。
 * 　ただし EventEffects.js と併用の際は EventEffects.js を、このプラグインの上に配置してください。
 *------------------------------
 * this.TF_setBalloon( [フキダシID], [パターン番号], [表示フレーム数], [完了までウェイト], [dx], [dy] );
 * 　TF_SET_BALLOONの機能
 *------------------------------
 * this.TF_locateBalloon( [dx], [dy] );
 * 　TF_LOCATE_BALLOONの機能
 *------------------------------
 * this.TF_stopBalloon( [消滅アニメを表示] );
 * 　TF_STOP_BALLOON の機能
 *------------------------------
 *
 *
 * 利用規約 : MITライセンス
 */

/*~struct~BalloonParamJa:
 * *
 * @param name
 * @desc  [フキダシID]に使用する名前
 * @type String
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
 * @desc 消滅に使用するパターン数。
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
 * @min 0
 *
 * @param waitTime
 * @desc 最終パターンの表示時間(フレーム)
 * @type Number
 * @default 12
 * @min 0
 */

( function() {
	'use strict';
	const TF_START_BALLOON = 'TF_START_BALLOON';
	const TF_SET_BALLOON = 'TF_SET_BALLOON';
	const TF_LOCATE_BALLOON = 'TF_LOCATE_BALLOON';
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
	const TF_baseDy = parseIntStrict( pluginParams.baseDy );
	const presetList = JsonEx.parse( pluginParams.preset );
	pluginParams.preset = presetList.map( value => {
		const params = JsonEx.parse( value );
		params.dx = parseIntStrict( params.dx );
		params.dy = parseIntStrict( params.dy ) + TF_baseDy;
		params.startPatterns = parseIntStrict( params.startPatterns );
		params.loopPatterns = parseIntStrict( params.loopPatterns );
		params.endPatterns = parseIntStrict( params.endPatterns );
		params.loops = parseIntStrict( params.loops );
		params.speed = parseIntStrict( params.speed );
		params.waitTime = parseIntStrict( params.waitTime );
		return params;
	} );


	/**
	 * 与えられた文字列に変数が指定されていたら、変数の内容に変換して返す。
	 * @param {String} value 変換元の文字列( v[n]形式を含む )
	 * @return {String} 変換後の文字列
	 */
	function treatValue( value ) {
		if( value === undefined || value === '' ) return '0';
		if( value[ 0 ] === 'V' || value[ 0 ] === 'v' ) {
			return value.replace( /[V]\[([0-9]+)\]/i, ( match, p1 ) => $gameVariables.value( parseInt( p1, 10 ) ) );
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
	}

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


	const EVENT_THIS = 'this';
	const EVENT_SELF = 'self';
	const EVENT_PLAYER = 'player';
	const EVENT_FOLLOWER0 = 'follower0';
	const EVENT_FOLLOWER1 = 'follower1';
	const EVENT_FOLLOWER2 = 'follower2';
	/**
	 * 文字列をイベントIDへ変換
	 * @param {String} value イベントIDの番号か識別子
	 * @returns {Number} 拡張イベントID
	 */
	function stringToEventId( value ) {
		value = treatValue( value );
		const result = parseInt( value, 10 );
		if( !isNaN( result ) ) return result;

		const lowValue = value.toLowerCase();
		switch( lowValue ) {
			case EVENT_THIS:
			case EVENT_SELF: return 0;
			case EVENT_PLAYER: return -1;
			case EVENT_FOLLOWER0: return -2;
			case EVENT_FOLLOWER1: return -3;
			case EVENT_FOLLOWER2: return -4;
		}

		// イベント名で指定できるようにする
		const i = $gameMap._events.findIndex( event => {
			if( event === undefined ) return false;	// _events[0] が undefined なので無視

			const eventId = event._eventId;
			return $dataMap.events[ eventId ].name === value;
		} );
		if( i === -1 ) throw Error( `指定したイベント[${value}]がありません。` );
		return i;
	}

	/**
	 * 文字列をフキダシIDへ変換
	 * @param {String} value フキダシIDの番号かnameプロパティ
	 * @returns {Number} フキダシID
	 */
	function stringToBalloonId( value ) {
		const result = parseInt( treatValue( value ), 10 );
		if( !isNaN( result ) ) return result;

		const i = pluginParams.preset.findIndex( e => e.name === value );
		if( i === -1 ) throw Error( `指定したフキダシ[${value}]がありません。` );
		return i + 1;
	}

	//TF_SET_BALLOON [イベントID] [フキダシID] [パターン番号] [表示フレーム数] [完了までウェイト] [dx] [dy]
	function setBalloon( character, balloonId, pattern, waitTime, dx, dy ) {
		if( !character ) return;
		character.TF_balloon = null;
		character.requestBalloon( stringToBalloonId( balloonId ) );
		pattern = ( pattern ? parseIntStrict( pattern ) : 8 );
		waitTime = ( waitTime ? parseIntStrict( waitTime ) : 64 );
		let loops = 1;
		if( waitTime === 0 ) {
			// waitTime:0 の場合は無限ループ
			loops = 0;
			waitTime = 2;
		}

		character.TF_balloon = {
			dx: parseIntStrict( dx ),
			dy: parseIntStrict( dy ) + TF_baseDy,
			startPatterns: ( pattern - 1 ),
			loopPatterns: 1,
			endPatterns: 0,
			loops: loops,
			speed: 0,
			waitTime: waitTime
		};
	}

	/**
	 * フキダシ待ち状態に設定。
	 * @param {Game_Character} character 実行中のイベント・プレイヤーキャラ
	 */
	function setWaitMode2Balloon( character ) {
		getInterpreterFromCharacter( character ).setWaitMode( WAIT_BALLOON );
	}
	const TRIGGER_PARALLEL = 4;	// 並列処理
	/**
	 * 	イベントで使われているインタプリタを取り出す。
	 * @param {*} character 
	 */
	function getInterpreterFromCharacter( character ) {
		let interpreter;
		if( character._trigger === TRIGGER_PARALLEL ) {
			interpreter = character._interpreter;
		} else {
			interpreter = $gameMap._interpreter;
		}
		while( interpreter._childInterpreter ) {
			interpreter = interpreter._childInterpreter;
		}
		return interpreter;
	}

	/**
	 * 
	 * @param {Game_CharacterBase} target 対象となるキャラ・イベント
	 * @param {Number} dx x差分
	 * @param {Number} dy y差分
	 */
	function locateBalloon( target, dx, dy ) {
		if( target.TF_balloon ) {
			if( dx !== undefined ) {
				target.TF_balloon.dx = parseIntStrict( dx );
			}
			if( dy !== undefined ) {
				target.TF_balloon.dy = parseIntStrict( dy ) + TF_baseDy;
			}
		}
	}

	/**
	 * フキダシアイコン表示の停止
	 * @param {Game_CharacterBase} target 対象となるキャラ・イベント
	 * @param {Boolean} showFinish 消滅アニメを表示するか
	 */
	function stopBalloon( target, showFinish ) {
		if( target.TF_balloon ) {
			if( !showFinish ) {
				target.TF_balloon._duration = 0;
			}
			target.TF_balloon.finishTrigger = true;
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
			this._character = getEventById( this, stringToEventId( args[ 0 ] ) );

			if( this._character ) {
				this._character.TF_balloon = null;
				this._character.requestBalloon( stringToBalloonId( args[ 1 ] ) );
				if( args[ 2 ] && args[ 2 ].toLowerCase() === PARAM_TRUE ) {
					this.setWaitMode( WAIT_BALLOON );
				}
				locateBalloon( this._character, args[ 3 ], args[ 4 ] );
			}
		} else if( commandStr === TF_SET_BALLOON ) {
			this._character = getEventById( this, stringToEventId( args[ 0 ] ) );
			setBalloon( this._character, args[ 1 ], args[ 2 ], args[ 3 ], args[ 5 ], args[ 6 ] );

			if( args[ 4 ] && args[ 4 ].toLowerCase() === PARAM_TRUE ) {
				this.setWaitMode( WAIT_BALLOON );
			}
		} else if( commandStr === TF_LOCATE_BALLOON ) {
			const target = getEventById( this, stringToEventId( args[ 0 ] ) );
			locateBalloon( target, args[ 1 ], args[ 2 ] );

		} else if( commandStr === TF_STOP_BALLOON ) {
			const target = getEventById( this, stringToEventId( args[ 0 ] ) );
			const showFinish = ( args[ 1 ] && args[ 1 ].toLowerCase() === PARAM_TRUE );
			stopBalloon( target, showFinish );
		}
	};

	/**
	 * フキダシを新規に生成すると判断できるように、TF_balloon を空にして呼び出す。
	 */
	const _Game_Interpreter_command213 = Game_Interpreter.prototype.command213;
	Game_Interpreter.prototype.command213 = function() {
		const target = this.character( this._params[ 0 ] );
		if( target ) target.TF_balloon = null;
		return _Game_Interpreter_command213.call( this );
	};

	/*--- Game_CharacterBase ---*/
	const _Game_CharacterBase_requestBalloon = Game_CharacterBase.prototype.requestBalloon;
	Game_CharacterBase.prototype.requestBalloon = function( balloonId ) {
		if( !this.TF_balloon ) {
			this.TF_balloon = Object.assign( {}, pluginParams.preset[ balloonId - 1 ] );// 参照渡しでなくコピー渡し
			this.TF_balloon.finishTrigger = false;
		}
		_Game_CharacterBase_requestBalloon.call( this, balloonId );
	};
	/*--- [移動ルートの設定]用のメソッド ---*/
	// EventEffects.js の機能を上書きして、dx, dy を追加
	Game_CharacterBase.prototype.balloon = function( balloonId, wait, dx, dy ) {
		Game_CharacterBase.prototype.TF_startBalloon.apply( this, arguments );
	};
	// TF_START_BALLOON に対応したメソッド
	Game_CharacterBase.prototype.TF_startBalloon = function( balloonId, wait, dx, dy ) {
		this.TF_balloon = null;
		this.requestBalloon( stringToBalloonId( balloonId ) );
		if( wait ) setWaitMode2Balloon( this );
		locateBalloon( this, dx, dy );
	};
	// TF_SET_BALLOON に対応したメソッド
	Game_CharacterBase.prototype.TF_setBalloon = function( balloonId, pattern, waitTime, wait, dx, dy ) {
		setBalloon( this, balloonId, pattern, waitTime, dx, dy );
		if( wait ) setWaitMode2Balloon( this );
	};
	// TF_LOCATE_BALLOON に対応したメソッド
	Game_CharacterBase.prototype.TF_locateBalloon = function( dx, dy ) {
		locateBalloon( this, dx, dy );
	};
	// TF_STOP_BALLOON に対応したメソッド
	Game_CharacterBase.prototype.TF_stopBalloon = function( showFinish ) {
		stopBalloon( this, showFinish );
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
	};

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
			TFb._duration = 8 * TFb.speed + TFb.waitTime;
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
		bs.x += TFb.dx;
		bs.y += TFb.dy;
		if( !TFb.finishTrigger ) return;

		TFb.finishTrigger = false;
		if( TFb._duration < TFb.loopEndDuration ) {
			bs._duration = TFb._duration;	// 即終了の場合 TFb._duration : 0 に設定してある
			TFb.phase = BALLOON_PHASE_WAIT;
		} else {
			bs._duration = TFb.loopEndDuration;
			TFb.phase = BALLOON_PHASE_END;
		}
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

		if( TFb.phase === BALLOON_PHASE_END && this._duration < TFb.endDuration ) {
			this._duration = this.waitTime();
			TFb.phase = BALLOON_PHASE_WAIT;
		}

		if( TFb.phase === BALLOON_PHASE_WAIT && this._duration === 0 ) {
			TFb.phase = '';
		}

		_Sprite_Balloon_update.call( this );
	};

	const _Sprite_Balloon_frameIndex = Sprite_Balloon.prototype.frameIndex;
	Sprite_Balloon.prototype.frameIndex = function() {
		const TFb = this.TF_balloon;
		if( this._duration < TFb.endDuration ) {
			return TFb.startPatterns + TFb.loopPatterns + TFb.endPatterns - 1;
		}
		return _Sprite_Balloon_frameIndex.call( this );
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
	};

	Sprite_Balloon.prototype.waitTime = function() {
		if( this.TF_balloon ) {
			return this.TF_balloon.waitTime;
		} else {
			return 12;	//すぐに上書きするので、これはダミー値
		}
	};


	/*--- Scene_Base ---*/

	// TODO: 画面の適当な位置に表示する
	function addBalloonToScene() {
		const balloon = new Sprite_Balloon();
		balloon.x = 200;
		balloon.y = 100;
		balloon.z = 7;
		SceneManager._scene.addChild( balloon );
	}

} )();
