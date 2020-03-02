//========================================
// TF_CharEx.js
// Version :0.5.2.2
// For : RPGツクールMV (RPG Maker MV)
// -----------------------------------------------
// Copyright : Tobishima-Factory 2020
// Website : http://tonbi.jp
//
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//========================================
/*:ja
 * @plugindesc キャラのアニメを強化
 * @author とんび@鳶嶋工房
 *
 * @param moveUnit
 * @desc 移動単位(TF_END_ANIME時の配置単位)
 * @type select
 * @option 通常(1タイル)
 * @value 1
 * @option 半歩(0.5タイル)
 * @value 0.5
 * @option なし(アナログ)
 * @value 0
 * @default 1
 * 
 * @help
 *
 *------------------------------
 * TF_SET_CHAR [イベントID] [画像ファイル名] [キャラ番号] [歩行パターン] [向き]
 * 　[移動ルートの設定] の[画像の変更]と[○を向く]に加え歩行パターンも一度に指定。
 * 　[イベントID] 0:このイベント、-1:プレイヤー、-2〜-4:隊列メンバー、1〜:イベントID(規定値:0)
 * 　　this:このイベント、player:プレイヤー、follower0:隊列メンバー0、follower1:隊列メンバー1、follower2:隊列メンバー2
 * 　　イベントの[名前]で指定(上記の数値や this などと同じ名前、およびスペースの入った名前は指定できません)
 * 　[画像ファイル名] .pngを除いた img/character/ フォルダのファイル名
 * 　[キャラ番号] 画像の上段左から 0,１, 2, 3 、下段目が 4, 5, 6, 7 となる番号
 * 　[歩行パターン] 3パターンアニメの左から 0, 1, 2(規定値:現在値)
 * 　[向き] 4方向のキャラの向き、テンキーに対応した 2, 4, 6, 8 (規定値:2、[歩行パターン]の指定がない場合は現在値)
 *
 * 　例: TF_SET_CHAR 2 !Door2 2 0 2
 *------------------------------
 * TF_SET_CHAR [イベントID] [画像ファイル名] [キャラ番号] [パターン]
 * 　[パターン] 一度に [歩行パターン] と [向き] を指定する番号(規定値:現在値)
 * 　歩行グラフィックの位置だと以下並び。
 * 　　0, 1, 2		<= 下向き(テンキー2)
 * 　　3, 4, 5		<= 左向き(テンキー4)
 * 　　6, 7, 8		<= 右向き(テンキー6)
 * 　　9, 10, 11 <= 上向き(テンキー8)
 * 　TF_SET_CHAR 以外でも [歩行パターン] [向き] の代わりに [パターン] を指定できる。
 *------------------------------
 * TF_LOCATE_CHAR [イベントID] [x] [y] [歩行パターン] [向き]
 * 　位置を設定。
 * 　[x] x位置(タイル数)
 * 　[y] y位置(タイル数)
 *
 * 　例: TF_LOCATE_CHAR モブおじさん 10 4 5
 *------------------------------
 * TF_START_ANIME [イベントID]
 * 　アニメモードに変更(移動アニメ停止・[すり抜け]ON)。
 * 
 * 　例: TF_START_ANIME this
 *------------------------------
 * TF_ANIME [イベントID] [mx] [my] [ウエイト] [キャラ番号] [歩行パターン] [向き]
 * 　アニメの指定。
 * 　[mx] x移動距離(規定値:0ピクセル)
 * 　[my] y移動距離(規定値:0ピクセル)
 * 　[ウエイト] 表示時間(規定値:3フレーム)
 * 
 * 　例: TF_ANIME -1 -4 8 12 0 0 6
 *------------------------------
 * TF_END_ANIME [イベントID]
 * 　通常モードに戻る。
 *
 * 　例: TF_END_ANIME follower0
 *------------------------------
 * TF_VD_ANIME [イベントID] [画像ファイル名] [キャラ番号] [歩行パターン] [ウエイト]
 * 　キャラ画像の縦下方向にアニメーションする(キャラの向きだと 左→右→上 の順)
 *
 * 　例:TF_VD_ANIME 2 !Door2 2 0
 *------------------------------
 * TF_VU_ANIME [イベントID] [画像ファイル名] [キャラ番号] [歩行パターン] [ウエイト]
 * 　キャラ画像の縦上方向にアニメーションする(キャラの向きだと 右→左→下 の順)
 *
 * 　例:TF_VU_ANIME
 *------------------------------
 * [イベントID][ウエイト][画像ファイル名][キャラ番号][歩行パターン][向き][x][y][mx][my]の
 * 値は全てV[n]の形式で、変数を指定できます。
 *
 * 例 : TF_LOCATE_CHAR 0 V[1] V[2]
 *------------------------------
 */

( function() {
	'use strict';
	const TF_SET_CHAR = 'TF_SET_CHAR';
	const TF_LOCATE_CHAR = 'TF_LOCATE_CHAR';
	const TF_START_ANIME = 'TF_START_ANIME';
	const TF_ANIME = 'TF_ANIME';
	const TF_END_ANIME = 'TF_END_ANIME';
	const TF_VD_ANIME = 'TF_VD_ANIME';
	const TF_VU_ANIME = 'TF_VU_ANIME';
	const PARAM_TRUE = 'true';

    /**
     * パラメータを受け取る
     */
	const pluginParams = PluginManager.parameters( 'TF_CharEx' );
	const TF_moveUnit = parseFloatStrict( pluginParams.moveUnit );


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
	 * 文字列をイベントIDへ変換
	 * @param {String} value イベントIDの番号か識別子
	 * @returns {Number} 拡張イベントID
	 */
	const EVENT_THIS = 'this';
	const EVENT_PLAYER = 'player';
	const EVENT_FOLLOWER0 = 'follower0';
	const EVENT_FOLLOWER1 = 'follower1';
	const EVENT_FOLLOWER2 = 'follower2';
	function stringToEventId( value ) {
		const result = parseInt( treatValue( value ), 10 );
		if( !isNaN( result ) ) return result;

		switch( value ) {
			case EVENT_THIS:
				return 0;
			case EVENT_PLAYER:
				return -1;
			case EVENT_FOLLOWER0:
				return -2;
			case EVENT_FOLLOWER1:
				return -3;
			case EVENT_FOLLOWER2:
				return -4;
		}

		// イベント名で指定できるようにする
		const i = $gameMap._events.findIndex( event => {
			if( event === undefined ) return false;	// _events[0] が undefined なので無視

			const eventId = event._eventId;
			return $dataMap.events[ eventId ].name === value
		} );
		if( i === -1 ) throw Error( `指定したイベント[${value}]がありません。` );
		return i;
	}


	// イベントコマンドの番号
	const COMMAND_END = 0;
	const TRANSFER_PLAYER = 201;
	const SET_MOVEMENT_ROUTE = 205;
	const CHANGE_PLAYER_FOLLOWERS = 216;
	const FADEOUT_SCREEN = 221;
	const FADEIN_SCREEN = 222;
	const WAIT_FOR = 230;
	const PLAY_SE = 250;
	const TF_PATTERN = 'TF_pattern';

	const PLAYER_CHARACTER = -1;
	const gc = Game_Character;



	/*---- Game_Interpreter ----*/
	/**
	 * プラグインコマンドの実行
	 */
	const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function( command, args ) {
		_Game_Interpreter_pluginCommand.apply( this, arguments );

		const commandStr = command.toUpperCase();
		if( commandStr === TF_SET_CHAR ) {
			setCharPattern.apply( this, args );
		} else if( commandStr === TF_LOCATE_CHAR ) {
			locateChar.apply( this, args );
		} else if( commandStr === TF_START_ANIME ) {
			startAnime.apply( this, args );
		} else if( commandStr === TF_END_ANIME ) {
			endAnime.apply( this, args );
		} else if( commandStr === TF_ANIME ) {
			anime.apply( this, args );
		} else if( commandStr === TF_VD_ANIME ) {
			vdAnime.apply( this, args );
		} else if( commandStr === TF_VU_ANIME ) {
			vuAnime.apply( this, args );
		}
	};

	/**
	 * TF_SET_CHAR  の実行
	 * @returns {Object} { id:{Number}, object:{Game_Character} }
	 */
	function setCharPattern( eventId, fileName, charaNo, patternNo, d ) {

		// キャラクタオブジェクト(Game_Character)
		const id = stringToEventId( eventId );
		const targetEvent = getEventById( this, id );

		// 画像ファイル
		if( fileName === undefined ) {
			fileName = targetEvent.characterName();
		} else {
			fileName = treatValue( fileName );
		}

		// キャラ番号
		if( charaNo === undefined ) {
			charaNo = targetEvent.characterIndex();
		} else {
			charaNo = parseIntStrict( charaNo );
		}

		targetEvent.setImage( fileName, charaNo );

		// パターン番号
		if( patternNo !== undefined ) {
			patternNo = parseIntStrict( patternNo );
			if( 2 < patternNo ) {
				d = ( Math.floor( patternNo / 3 ) + 1 ) * 2;
				patternNo %= 3;
			} else {
				d = ( d === undefined ) ? 2 : parseIntStrict( d );
			}
			targetEvent._originalPattern = patternNo;
			targetEvent.setPattern( patternNo );

			// 向きを設定
			const tmp = targetEvent.isDirectionFixed();
			targetEvent.setDirectionFix( false );
			targetEvent.setDirection( d );
			targetEvent.setDirectionFix( tmp );
		}

		return { id: id, object: targetEvent };
	}

	/**
	 * TF_LOCATE_CHAR  の実行
	 */
	function locateChar( eventId, x, y, patternNo, d ) {
		let targetEvent;
		if( patternNo ) {
			targetEvent = setCharPattern.call( this, eventId, undefined, undefined, patternNo, d ).object;
		} else {
			targetEvent = getEventById( this, stringToEventId( eventId ) );
		}
		targetEvent.setPosition( parseFloatStrict( x ), parseFloatStrict( y ) );// HalfMove.js 対応でparseFloatStrict()を使う
	}

	/**
	 * TF_START_ANIME  の実行
	 */
	function startAnime( eventId ) {
		const targetEvent = getEventById( this, stringToEventId( eventId ) );
		targetEvent.setThrough( true );
		targetEvent.TF_isAnime = true;
	}

	/**
	 * TF_END_ANIME  の実行
	 */
	function endAnime( eventId ) {
		const targetEvent = getEventById( this, stringToEventId( eventId ) );
		targetEvent.setThrough( false );
		targetEvent.TF_isAnime = false;


		if( TF_moveUnit === 0 ) {
			targetEvent._x = targetEvent._realX;
			targetEvent._y = targetEvent._realY;
		} else if( TF_moveUnit === 1 ) {
			// タイル座標に合わせて丸める
			targetEvent._x = Math.round( targetEvent._realX );
			targetEvent._y = Math.round( targetEvent._realY );
		} else {
			// 単位座標に合わせて丸める
			targetEvent._x = Math.round( targetEvent._realX / TF_moveUnit ) * TF_moveUnit;
			targetEvent._y = Math.round( targetEvent._realY / TF_moveUnit ) * TF_moveUnit;
		}
	}

	/**
	 * TF_ANIME  の実行
	 */
	function anime( eventId, mx, my, waitFrames, charaNo, patternNo, d ) {
		const result = setCharPattern.call( this, eventId, undefined, charaNo, patternNo, d );
		result.object._realX += parseIntStrict( mx ) / $gameMap.tileWidth();
		result.object._realY += parseIntStrict( my ) / $gameMap.tileHeight();
		waitFrames = ( waitFrames === undefined ) ? 3 : parseIntStrict( waitFrames );
		const commandList = [
			{ indent: 0, code: WAIT_FOR, parameters: [ waitFrames ] },
			{ indent: 0, code: COMMAND_END }
		];
		this.setupChild( commandList, result.id );
	}

	/**
	 * TF_VD_ANIME  の実行
	 */
	function vdAnime( eventId, fileName, charaNo, patternNo, waitFrames ) {
		waitFrames = ( waitFrames === undefined ) ? 3 : parseIntStrict( waitFrames );
		const result = setCharPattern.call( this, eventId, fileName, charaNo, patternNo );
		const tempDirectionFix = result.object.isDirectionFixed();
		result.object.setDirectionFix( false );
		this._params = [ result.id, {
			repeat: false, skippable: true, wait: true, list: [
				{ code: gc.ROUTE_TURN_LEFT },
				{ code: gc.ROUTE_WAIT, parameters: [ waitFrames ] },
				{ code: gc.ROUTE_TURN_RIGHT },
				{ code: gc.ROUTE_WAIT, parameters: [ waitFrames ] },
				{ code: gc.ROUTE_TURN_UP },
				{ code: tempDirectionFix ? gc.ROUTE_DIR_FIX_ON : gc.ROUTE_DIR_FIX_OFF },
				{ code: gc.ROUTE_END }
			]
		} ];
		this.command205();	// SET_MOVEMENT_ROUTE
	}

	/**
	 * TF_VU_ANIME  の実行
	 */
	function vuAnime( eventId, fileName, charaNo, patternNo, waitFrames ) {
		waitFrames = ( waitFrames === undefined ) ? 3 : parseIntStrict( waitFrames );
		const result = setCharPattern.call( this, eventId, fileName, charaNo, patternNo );
		const tempDirectionFix = result.object.isDirectionFixed();
		result.object.setDirectionFix( false );
		this._params = [ result.id, {
			repeat: false, skippable: true, wait: true, list: [
				{ code: gc.ROUTE_TURN_RIGHT },
				{ code: gc.ROUTE_WAIT, parameters: [ waitFrames ] },
				{ code: gc.ROUTE_TURN_LEFT },
				{ code: gc.ROUTE_WAIT, parameters: [ waitFrames ] },
				{ code: gc.ROUTE_TURN_DOWN },
				{ code: tempDirectionFix ? gc.ROUTE_DIR_FIX_ON : gc.ROUTE_DIR_FIX_OFF },
				{ code: gc.ROUTE_END }
			]
		} ];
		this.command205();	// SET_MOVEMENT_ROUTE
	}

	/**
	 *  コマンドリストから呼ばれた場合。
	 * @example { indent: 0, code: TF_PATTERN, parameters: [ 2, '!Door2', 2, 0, 2 ] },
	 */
	Game_Interpreter.prototype.commandTF_pattern = function() {
		setCharPattern.apply( this, this._params );
	}

	/*---- Game_CharacterBase ----*/
	/**
	 * TF_START_ANIME, TF_END_ANIME 対応。
	 */
	const _Game_CharacterBase_isMoving = Game_CharacterBase.prototype.isMoving;
	Game_CharacterBase.prototype.isMoving = function() {
		if( this.TF_isAnime ) return false;
		return _Game_CharacterBase_isMoving.call( this );
	}

	/*---- Game_Player ----*/
	const _Game_Player_initMembers = Game_Player.prototype.initMembers;
	Game_Player.prototype.initMembers = function() {
		_Game_Player_initMembers.call( this );
		this._originalPattern = 1;
	}
	Game_Player.prototype.isOriginalPattern = function() {
		return this.pattern() === this._originalPattern;
	};

	/*---- Game_Follower ----*/
	const _Game_Follower_initMembers = Game_Follower.prototype.initMembers;
	Game_Follower.prototype.initMembers = function() {
		_Game_Follower_initMembers.call( this );
		this._originalPattern = 1;
	}
	Game_Follower.prototype.isOriginalPattern = function() {
		return this.pattern() === this._originalPattern;
	};
} )();