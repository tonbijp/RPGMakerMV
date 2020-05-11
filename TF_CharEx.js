//========================================
// TF_CharEx.js
// Version :0.7.0.0
// For : RPGツクールMV (RPG Maker MV)
// -----------------------------------------------
// Copyright : Tobishima-Factory 2020
// Website : http://tonbi.jp
//
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//========================================
/*:ja
 * @plugindesc キャラのアニメや移動など強化
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
 *
 * 【プラグインコマンド】
 * ------------------------------
 * TF_SET_CHAR [イベントID] [画像ファイル名] [キャラ番号] [歩行パターン] [向き]
 * 　イベントコマンド[移動ルートの設定] の[画像の変更]と[○を向く]に加え歩行パターンも一度に指定。
 * 　[イベントID] 0:このイベント、-1:プレイヤー、-2〜-4:隊列メンバー、1〜:イベントID(規定値:0) ※下部詳細参照
 * 　[画像ファイル名] .pngを除いた img/character/ フォルダのファイル名
 * 　[キャラ番号] 画像の上段左から 0,１, 2, 3 、下段が 4, 5, 6, 7 となる番号
 * 　[歩行パターン] 3パターンアニメの左から 0, 1, 2(規定値:現在値)
 * 　[向き] 4方向のキャラの向き (規定値:2、[歩行パターン]の指定がない場合は現在値)
 *
 * 　例: TF_SET_CHAR self !Door 2 0 D
 * ------------------------------
 * TF_SET_CHAR [イベントID] [画像ファイル名] [キャラ番号] [キャラパターン]
 * 　[キャラパターン] 一度に [歩行パターン] と [向き] を指定する番号(規定値:現在値) ※下部詳細参照
 * 
 * 　例: TF_SET_CHAR player Animal 7 11
 * ------------------------------
 * TF_CHANGE_CHAR [イベントID] [キャラ番号] [歩行パターン] [向き]
 * TF_CHANGE_CHAR [イベントID] [キャラ番号] [キャラパターン]
 * 　TF_SET_CHAR から[画像ファイル名]を抜いたコマンド
 * ------------------------------
 * TF_LOCATE_CHAR [イベントID] [x] [y] [歩行パターン] [向き]
 * 　位置を設定。
 * 　[x] x位置(タイル数)
 * 　[y] y位置(タイル数)
 *
 * 　例: TF_LOCATE_CHAR モブおじさん 10 4 5
 * ------------------------------
 * TF_LOCATE_CHAR [イベントID] [x] [y] [キャラパターン]
 * ------------------------------
 * TF_MOVE_CHAR [イベントID] [向き] [移動距離]
 * 　指定方向に指定タイル数移動。
 * 　[移動距離] 移動距離(タイル数)
 *
 * 　例: TF_MOVE_CHAR self up 10
 * ------------------------------
 * [スクリプト] this.TF_moveChar( [イベントID], [向き], [移動距離] );
 * [移動ルートの設定][スクリプト] this.TF_moveChar(  [向き], [移動距離] );
 * ------------------------------
 * TF_MOVE_ROUTE [イベントID] [移動指定] [繰り返し] [飛ばす] [待つ]
 * 　イベントコマンドの[ルートの設定]を一行で書く。
 * 　[移動指定] 専用コマンド文字(例:←↓↑→)+数値の連続 ※下部詳細参照
 * 　[繰り返し] 指定した動作を繰り返すか(規定値:false)
 * 　[飛ばす] 移動できない場合は飛ばすか(規定値:true)
 * 　[待つ] 移動が終わるのを待つか(規定値:true)
 *
 * 　例: TF_MOVE_ROUTE this ↑4⤵︎5→3 OFF ON OFF
 * ------------------------------
 * TF_START_ANIME [イベントID]
 * 　アニメモードに変更(移動アニメ停止・[すり抜け]ON)
 * 
 * 　例: TF_START_ANIME this
 * ------------------------------
 * TF_ANIME [イベントID] [mx] [my] [ウェイト] [キャラ番号] [歩行パターン] [向き]
 * 　アニメの指定。TF_START_ANIME でアニメモードする必要がある。
 * 　[mx] x移動距離(規定値:0ピクセル)
 * 　[my] y移動距離(規定値:0ピクセル)
 * 　[ウェイト] 表示時間(規定値:[移動速度]より算出)※下部詳細参照
 * 
 * 　例: TF_ANIME -1 -4 8 12 0 0 6
 * ------------------------------
 * TF_ANIME [イベントID] [mx] [my] [ウェイト] [キャラ番号] [キャラパターン]
 * ------------------------------
 * TF_ANIME [イベントID] [mx] [my] [ウェイト] [キャラパターン]
 * 　[キャラ番号]は現在の番号になる。
 * ------------------------------
 * TF_END_ANIME [イベントID]
 * 　通常モードに戻る。アニメの指定が終わったら実行すること。
 *
 * 　例: TF_END_ANIME follower0
 * ------------------------------
 * TF_VD_ANIME [イベントID] [画像ファイル名] [キャラ番号] [歩行パターン] [ウェイト]
 * 　キャラ画像の縦下方向にアニメーションする(キャラの向きだと 左→右→上 の順)
 *
 * 　例:TF_VD_ANIME 2 !Door2 2 0
 * ------------------------------
 * TF_VU_ANIME [イベントID] [画像ファイル名] [キャラ番号] [歩行パターン] [ウェイト]
 * 　キャラ画像の縦上方向にアニメーションする(キャラの向きだと 右→左→下 の順)
 *
 * 　例:TF_VU_ANIME
 * =========================
 * 【詳細】
 * ------------------------------
 * [イベントID] は数字の他、以下の文字が利用できる。
 * 　このイベント: this(またはself):
 * 　プレイヤー: player
 * 　隊列メンバー0: follower0
 * 　隊列メンバー1: follower1
 * 　隊列メンバー2: follower2
 * ------------------------------
 *  [イベントID] は、イベントの[名前]でも指定できる。
 * ただし、数値や 上記 this などと同じ名前、およびスペースの入った名前は指定できない。
 * ------------------------------
 * [向き]にはテンキーに対応した数字の他、以下の文字が利用できる。
 * 　上: up, u, north, n, ↑, 上, 北
 * 　左: left, l, west, w, ←, 左, 西
 * 　右: right, r, east, e, →, 右, 東
 * 　下: down, d, south, s, ↓, 下, 南
 * 　※大文字小文字の区別をしません。
 * ------------------------------
 * [キャラパターン]は歩行グラフィックの[歩行パターン]と[向き]を一度に指定する。
 * 　0, 1, 2		<= 下向き(テンキー2)
 * 　3, 4, 5		<= 左向き(テンキー4)
 * 　6, 7, 8		<= 右向き(テンキー6)
 * 　9, 10, 11 <= 上向き(テンキー8)
 * ------------------------------
 * [移動指定] コマンド文字+数字を一単位とする文字列。
 * かなり量があるので、印刷するなどして手元で確認することを推奨。
 * 移動系のコマンドは数字に0を指定すると方向転換(〇〇を向く)と判断される。
 * 　[〇〇に移動] : [方向]に使える文字に加え以下の文字が使える。
 * 　　左上: upleft, ul, northwest, nw, ↖︎, 左上, 北西
 * 　　右上: upright, ur, northeast, ne, ↗︎, 右上, 北東
 * 　　左下: downleft, dl, southwest, sw, ↙︎, 左下, 南西
 * 　　右下: downright, dr, southeast, se, ↘︎, 右下, 南東
 * 　　ランダム: random, &, 乱
 * 　　プレイヤーに近づく: tward, t, 近
 * 　　プレイヤーから遠ざかる: away, y, 遠
 * 　　一歩前進(0は何もしない): front, forward, f, 前
 * 　　一歩後退(0は[180度回転]): back, backward, b, 後
 * 　[ジャンプ…] : jump, j, 跳
 * 　　数字が0の場合は、その場でジャンプ。
 * 　　コンマ( , )で区切ってx,yの座標が指定できる(空白不可)
 * 　[ウェイト…] : wait, z, 待
 * 　　数字はフレーム数。z は寝るイメージ。
 * 　[右に90度回転] : turnright, >, ⤵︎
 * 　　数字に0を指定すると[ランダムに方向転換]
 * 　　1の場合即時変更、2以降は[移動速度]に応じたウェイトをして回転。
 * 　[左に90度回転] : turnleft, <, ⤹, ⤴
 * 　　数字に0を指定すると[右か左に90度回転]
 * 　　1の場合即時変更、2以降は[移動速度]に応じたウェイトをして回転。
 * 　[スイッチ] : switch, o, ス
 * 　　コンマ( , )で区切って一つ目の数字はスイッチID。
 * 　　ふたつ目の数字が0の場合は[スイッチOFF…]、1で[スイッチON…]
 * 　　o はスイッチOn の o 。
 * 　[移動速度の変更…] : agility, a, 速
 * 　　1: 1 / 8倍速, 2: 1 / 4倍速, 3: 1 / 2倍速, 4: 通常速, 5: 2倍速, 6: 4倍速
 * 　[移動頻度の変更…] : freaqency, q, 頻
 * 　　1: 最低, 2: 低, 3: 通常, 4: 高, 5: 最高
 * 　[歩行アニメ] : walk, k, 歩
 * 　　数字が0の場合は[歩行アニメOFF]、1で[歩行アニメON]
 * 　[足踏みアニメ] : step, p, 踏
 * 　　数字が0の場合は[足踏みアニメOFF]、1で[足踏みアニメON]
 * 　[向き固定] : fix, x, 固
 * 　　数字が0の場合は[向き固定OFF]、1で[向き固定ON]
 * 　[すり抜け] : through, g, 抜
 * 　　数字が0の場合は[すり抜けOFF]、1で[すり抜けON]
 * 　[透明化] : invisible, i, 透
 * 　　数字が0の場合は[透明化OFF]、1で[透明化ON]
 * 　[表示] : visible, v, 示
 * 　　数字が0の場合は[表示OFF]、1で[表示ON]
 * 　　透明化のOFFで見えるというのが分かりづらく間違いまくるので追加。
 * 　[キャラパターンの変更] : change, c, 変
 * 　　コンマ( , )で区切って [キャラ番号],[歩行パターン],[向き] を数字で指定。
 * 　　標準のコマンド[画像の変更…]は数字だけで指定できないので、
 * 　　現在指定しているキャラ画像内での変更するコマンドを別に追加。
 * 　　[画像の変更…]はファイルとキャラの変更はできるが、
 * 　　パターンの変更はできないので、むしろ高機能かもしれない。
 * ------------------------------
 * 移動速度をウェイトに変換する場合以下のような対応となる。
 * 　1 / 8倍速 … 64フレーム
 * 　1 / 4倍速 … 32フレーム
 * 　1 / 2倍速 … 16フレーム
 * 　通常速 … 8フレーム
 * 　2倍速 … 4フレーム
 * 　4倍速 … 2フレーム
 * ------------------------------
 * [イベントID][ウェイト][画像ファイル名][キャラ番号][歩行パターン][向き][x][y][mx][my]の
 * 値は全てV[n]の形式で、変数を指定できる。
 * 
 * 例 : TF_LOCATE_CHAR 0 V[1] V[2]
 */

( function() {
	'use strict';

	const PARAM_TRUE = 'true';
	const PARAM_ON = 'on';

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
			return value.replace( /[v]\[([0-9]+)\]/i, ( match, p1 ) => $gameVariables.value( parseInt( p1, 10 ) ) );
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
     * @param {String} value 変換元文字列
     * @returns {Boolean} 
     */
	function parseBooleanStrict( value ) {
		value = treatValue( value );
		const result = value.toLowerCase();
		return ( result === PARAM_TRUE || result === PARAM_ON );
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

	const DIRECTION_DOWN_LEFT = [ 'downleft', 'dl', 'southwest', 'sw', '↙︎', '左下', '南西' ];
	const DIRECTION_DOWN = [ 'down', 'd', 'south', 's', '↓', '下', '南' ];
	const DIRECTION_DOWN_RIGHT = [ 'downright', 'dr', 'southeast', 'se', '↘︎', '右下', '南東' ];
	const DIRECTION_LEFT = [ 'left', 'l', 'west', 'w', '←', '左', '西' ];
	const DIRECTION_RIGHT = [ 'right', 'r', 'east', 'e', '→', '右', '東' ];
	const DIRECTION_UP_LEFT = [ 'upleft', 'ul', 'northwest', 'nw', '↖︎', '左上', '北西' ];
	const DIRECTION_UP = [ 'up', 'u', 'north', 'n', '↑', '上', '北' ];
	const DIRECTION_UP_RIGHT = [ 'upright', 'ur', 'northeast', 'ne', '↗︎', '右上', '北東' ];
	/**
	 * 方向文字列をテンキー方向の数値に変換して返す
	 * @param {String} value 方向た文字列
	 * @returns {Number} テンキー方向の数値(変換できなかった場合:undefined)
	 */
	function stringToDirection( value ) {
		value = treatValue( value );
		const result = parseInt( value, 10 );
		if( !isNaN( result ) ) return result;

		value = value.toLowerCase();
		if( DIRECTION_DOWN_LEFT.includes( value ) ) return 1;
		if( DIRECTION_DOWN.includes( value ) ) return 2;
		if( DIRECTION_DOWN_RIGHT.includes( value ) ) return 3;
		if( DIRECTION_LEFT.includes( value ) ) return 4;
		if( DIRECTION_RIGHT.includes( value ) ) return 6;
		if( DIRECTION_UP_LEFT.includes( value ) ) return 7;
		if( DIRECTION_UP.includes( value ) ) return 8;
		if( DIRECTION_UP_RIGHT.includes( value ) ) return 9;
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
	const TF_SET_CHAR = 'TF_SET_CHAR';
	const TF_CHANGE_CHAR = 'TF_CHANGE_CHAR';
	const TF_LOCATE_CHAR = 'TF_LOCATE_CHAR';
	const TF_MOVE_CHAR = 'TF_MOVE_CHAR';
	const TF_MOVE_ROUTE = 'TF_MOVE_ROUTE';
	const TF_START_ANIME = 'TF_START_ANIME';
	const TF_ANIME = 'TF_ANIME';
	const TF_END_ANIME = 'TF_END_ANIME';
	const TF_VD_ANIME = 'TF_VD_ANIME';
	const TF_VU_ANIME = 'TF_VU_ANIME';
	/**
	 * プラグインコマンドの実行。
	 */
	const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function( command, args ) {
		_Game_Interpreter_pluginCommand.apply( this, arguments );

		const idToEv = ( id ) => getEventById( this, stringToEventId( id ) );
		const commandStr = command.toUpperCase();
		switch( commandStr ) {
			case TF_SET_CHAR: setCharPattern( idToEv( args[ 0 ] ), args[ 1 ], args[ 2 ], args[ 3 ], args[ 4 ] ); break;
			case TF_CHANGE_CHAR: setCharPattern( idToEv( args[ 0 ] ), undefined, args[ 1 ], args[ 2 ], args[ 3 ] ); break;
			case TF_LOCATE_CHAR: locateChar( idToEv( args[ 0 ] ), args[ 1 ], args[ 2 ], args[ 3 ], args[ 4 ] ); break;
			case TF_MOVE_CHAR: moveChar( idToEv( args[ 0 ] ), args[ 1 ], args[ 2 ] ); break;
			case TF_MOVE_ROUTE: moveRoute.apply( this, args ); break;
			case TF_START_ANIME: startAnime( idToEv( args[ 0 ] ) ); break;
			case TF_END_ANIME: endAnime( idToEv( args[ 0 ] ) ); break;
			case TF_ANIME: anime.apply( this, args ); break;
			case TF_VD_ANIME: vdAnime.apply( this, args ); break;
			case TF_VU_ANIME: vuAnime.apply( this, args ); break;
		}
	};

	/**
	 * moveChar() を呼び出す。
	 */
	Game_Interpreter.prototype.TF_moveChar = function( eventId, d, distance ) {
		const targetEvent = getEventById( this, stringToEventId( eventId ) );
		moveChar( targetEvent, d, distance );
	};
	Game_CharacterBase.prototype.TF_moveChar = function( d, distance ) {
		moveChar( this, d, distance );
	};


	/**
	 * TF_SET_CHAR  の実行。
	 *
	 * @param {Game_Character} targetEvent イベント・プレイヤー・フォロワーのいずれか
	 * @param {String} fileName キャラクタファイル名( img/characters/ 以下)
	 * @param {String} charaNo キャラクタ番号( 0~7 )
	 * @param {String} patternNo パターン番号( 0~2 )
	 * @param {String} d キャラの向き(テンキー対応)
	 * @returns {Object} { id:{Number}, object:{Game_Character} }
	 */
	function setCharPattern( targetEvent, fileName, charaNo, patternNo, d ) {

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
				d = ( d === undefined ) ? 2 : stringToDirection( d );
			}
			targetEvent._originalPattern = patternNo;
			targetEvent.setPattern( patternNo );

			// 向きを設定
			const tmp = targetEvent.isDirectionFixed();
			targetEvent.setDirectionFix( false );
			targetEvent.setDirection( d );
			targetEvent.setDirectionFix( tmp );
		}

		return targetEvent;
	}

	/**
	 * TF_LOCATE_CHAR  の実行。
	 *
	 * @param {Game_Character} targetEvent イベント・プレイヤー・フォロワーのいずれか
	 * @param {String} x x座標(タイル数)
	 * @param {String} y y座標(タイル数)
	 * @param {String} patternNo パターン番号( 0~2 )
	 * @param {String} d キャラの向き(テンキー対応)
	 */
	function locateChar( targetEvent, x, y, patternNo, d ) {
		if( patternNo ) {
			setCharPattern( targetEvent, undefined, undefined, patternNo, d );
		}
		targetEvent.setPosition( parseFloatStrict( x ), parseFloatStrict( y ) );// HalfMove.js 対応でparseFloatStrict()を使う
	}


	// ab_defg_ijkl_nopqrstu_wxyz&<>

	const MOVE_RANDOM = [ 'random', '&', '＆', '乱' ]; // [ランダムに方向転換][ランダムに移動]
	const MOVE_TWARD = [ 'tward', 't', '近' ]; // [プレイヤーの方を向く][プレイヤーに近づく]
	const MOVE_AWAY = [ 'away', 'y', '遠' ]; // [プレイヤーの逆を向く][プレイヤーから遠ざかる]
	const MOVE_FORWARD = [ 'front', 'forward', 'f', '前' ]; // [一歩前進]
	const MOVE_BACKWARD = [ 'back', 'backward', 'b', '後' ]; // [180度回転][一歩後退]
	const MOVE_JUMP = [ 'jump', 'j', '跳' ]; // [ジャンプ…]
	const MOVE_WAIT = [ 'wait', 'z', '待' ]; // [ウェイト…]
	const MOVE_TURN_90D_R = [ 'turnright', '>', '＞', '⤵︎' ]; // [ランダムに方向転換][右に90度回転]
	const MOVE_TURN_90D_L = [ 'turnleft', '<', '＜', '⤹', '⤴' ]; // [右か左に90度回転][左に90度回転]
	const MOVE_SWITCH = [ 'switch', 'o', 'ス' ]; // [スイッチON…][スイッチOFF…]
	const MOVE_SPEED = [ 'agility', 'a', '速' ]; // [移動速度の変更…]
	const MOVE_FREQ = [ 'freaqency', 'q', '頻' ]; // [移動頻度の変更…]
	const MOVE_WALK = [ 'walk', 'k', '歩' ]; // [歩行アニメON][歩行アニメOFF]
	const MOVE_STEP = [ 'step', 'p', '踏' ]; // [足踏みアニメON][足踏みアニメOFF]
	const MOVE_DIR_FIX = [ 'fix', 'x', '固' ]; // [向き固定ON][向き固定OFF]
	const MOVE_THROUGH = [ 'through', 'g', '抜' ]; // [すり抜けON][すり抜けOFF]
	const MOVE_INVISIBLE = [ 'invisible', 'i', '透' ]; // [透明化ON][透明化OFF]
	const MOVE_VISIBLE = [ 'visible', 'v', '示' ]; // 透明化の逆
	const MOVE_CHENGE = [ 'change', 'c', '変' ]; // キャラパターンの変更 [画像の変更…]の代用

	// ROUTE_CHANGE_OPACITY
	// ROUTE_CHANGE_BLEND_MODE
	// ROUTE_PLAY_SE
	// ROUTE_SCRIPT

	/**
	 * 
	 *	this が インタプリタである必要がある。
	 * @param {String} eventId イベントIDかそれに替わる識別子の文字列
	 * @param {String} mml MML(Moving Macro Language) の文字列
	 * @param {String} repeat 繰り返すか(規定値:false)
	 * @param {String} skippable 移動できない場合とばすか(規定値:true)
	 * @param {String} wait 待つか(規定値:true)
	 */
	function moveRoute( eventId, mml, repeat, skippable, wait ) {
		eventId = stringToEventId( eventId );
		const targetEvent = getEventById( this, stringToEventId( eventId ) );
		const mmlArray = mml.match( /[^0-9.,-]+[0-9.,-]+/ig );
		repeat = parseBooleanStrict( repeat );
		skippable = ( skippable === undefined ) ? true : parseBooleanStrict( skippable );
		wait = ( wait === undefined ) ? true : parseBooleanStrict( wait );
		let movementList = [];
		let moveSpeed = targetEvent.moveSpeed();
		mmlArray.forEach( ( code ) => {
			const opcode = code.match( /[^0-9.,-]+/ )[ 0 ];
			const opland = code.match( /[0-9.,-]+/ )[ 0 ];
			const paramNo = parseInt( opland );
			const d = stringToDirection( opcode );
			if( d !== undefined ) {
				const d4 = convertD8to4( d );
				if( paramNo === 0 ) { // [下を向く][左を向く][右を向く][上を向く]
					const moveCode = [ gc.ROUTE_TURN_DOWN,
					gc.ROUTE_TURN_LEFT, gc.ROUTE_TURN_RIGHT,
					gc.ROUTE_TURN_UP ][ d4 / 2 - 1 ];
					movementList.push( { code: moveCode } );

				} else { // [左下に移動][下に移動][右下に移動][左に移動][右に移動][左上に移動][上に移動][右上に移動]
					const moveCode = [
						gc.ROUTE_MOVE_LOWER_L, gc.ROUTE_MOVE_DOWN, gc.ROUTE_MOVE_LOWER_R,
						gc.ROUTE_MOVE_LEFT, null, gc.ROUTE_MOVE_RIGHT,
						gc.ROUTE_MOVE_UPPER_L, gc.ROUTE_MOVE_UP, gc.ROUTE_MOVE_UPPER_R,
					][ d - 1 ];
					for( let i = 0; i < paramNo; i++ ) {
						movementList.push( { code: moveCode } );
					}
				}
				return;
			}


			const value = opcode.toLowerCase();
			if( MOVE_RANDOM.includes( value ) ) { // [ランダムに方向転換][ランダムに移動]
				if( paramNo === 0 ) {
					movementList.push( { code: gc.ROUTE_TURN_RANDOM } );
				} else {
					for( let i = 0; i < paramNo; i++ ) {
						movementList.push( { code: gc.ROUTE_MOVE_RANDOM } );
					}
				}

			} else if( MOVE_TWARD.includes( value ) ) { // [プレイヤーの方を向く][プレイヤーに近づく]
				if( paramNo === 0 ) {
					movementList.push( { code: gc.ROUTE_TURN_TOWARD } );
				} else {
					for( let i = 0; i < paramNo; i++ ) {
						movementList.push( { code: gc.ROUTE_MOVE_TOWARD } );
					}
				}

			} else if( MOVE_AWAY.includes( value ) ) { // [プレイヤーの逆を向く][プレイヤーから遠ざかる]
				if( paramNo === 0 ) {
					movementList.push( { code: gc.ROUTE_TURN_AWAY } );
				} else {
					for( let i = 0; i < paramNo; i++ ) {
						movementList.push( { code: gc.ROUTE_MOVE_AWAY } );
					}
				}

			} else if( MOVE_FORWARD.includes( value ) ) { // [一歩前進]
				for( let i = 0; i < paramNo; i++ ) {
					movementList.push( { code: gc.ROUTE_MOVE_FORWARD, parameters: [ paramNo ] } );
				}

			} else if( MOVE_BACKWARD.includes( value ) ) { // [180度回転][一歩後退]
				if( paramNo === 0 ) {
					movementList.push( { code: gc.ROUTE_TURN_180D } );
				} else {
					for( let i = 0; i < paramNo; i++ ) {
						movementList.push( { code: gc.ROUTE_MOVE_BACKWARD } );
					}
				}

			} else if( MOVE_JUMP.includes( value ) ) { // [ジャンプ…]
				const result = opland.match( /([0-9-]*),([0-9-]*)/ );
				let x, y;
				if( result === null ) {
					x = 0;
					y = 0;
				} else {
					x = Boolean( result[ 1 ] ) ? parseInt( result[ 1 ] ) : 0;
					y = Boolean( result[ 2 ] ) ? parseInt( result[ 2 ] ) : 0;
				}
				movementList.push( { code: gc.ROUTE_JUMP, parameters: [ x, y ] } );

			} else if( MOVE_WAIT.includes( value ) ) { // [ウェイト]
				movementList.push( { code: gc.ROUTE_WAIT, parameters: [ paramNo ] } );

			} else if( MOVE_TURN_90D_R.includes( value ) ) { // [ ランダムに方向転換 ][ 右に90度回転 ]
				if( paramNo === 0 ) {
					movementList.push( { code: gc.ROUTE_TURN_RANDOM } );
				} else if( paramNo === 1 ) {
					movementList.push( { code: gc.ROUTE_TURN_90D_R } );
				} else {
					const waitFrames = speedToFrames( moveSpeed );
					for( let i = 0; i < paramNo; i++ ) {
						movementList.push( { code: gc.ROUTE_TURN_90D_R } );
						movementList.push( { code: gc.ROUTE_WAIT, parameters: [ waitFrames ] } );
					}
				}

			} else if( MOVE_TURN_90D_L.includes( value ) ) { // [右か左に90度回転][左に90度回転]
				if( paramNo === 0 ) {
					movementList.push( { code: gc.ROUTE_TURN_90D_R_L } );
				} else if( paramNo === 1 ) {
					movementList.push( { code: gc.ROUTE_TURN_90D_L } );
				} else {
					const waitFrames = speedToFrames( moveSpeed );
					for( let i = 0; i < paramNo; i++ ) {
						movementList.push( { code: gc.ROUTE_TURN_90D_L } );
						movementList.push( { code: gc.ROUTE_WAIT, parameters: [ waitFrames ] } );
					}
				}

			} else if( MOVE_SWITCH.includes( value ) ) { // [スイッチON…][スイッチOFF…]
				const result = opland.match( /([0-9-]*),([0-9-]*)/ );
				let id, sw;
				if( result === null ) {
					id = paramNo;
					sw = 1;
				} else {
					id = Boolean( result[ 1 ] ) ? parseInt( result[ 1 ] ) : 1;
					sw = Boolean( result[ 2 ] ) ? parseInt( result[ 2 ] ) : 1;
				}
				if( sw ) {
					movementList.push( { code: gc.ROUTE_SWITCH_ON, parameters: [ id ] } );
				} else {
					movementList.push( { code: gc.ROUTE_SWITCH_OFF, parameters: [ id ] } );
				}

			} else if( MOVE_SPEED.includes( value ) ) { // [移動速度の変更…]
				movementList.push( { code: gc.ROUTE_CHANGE_SPEED, parameters: [ paramNo ] } );
				moveSpeed = paramNo;	// 回転の速度に使っているので、定義時に速度がわかっている必要がある

			} else if( MOVE_FREQ.includes( value ) ) { // [移動頻度の変更…]
				movementList.push( { code: gc.ROUTE_CHANGE_FREQ, parameters: [ paramNo ] } );

			} else if( MOVE_WALK.includes( value ) ) { // [歩行アニメON][歩行アニメOFF]
				movementList.push( { code: paramNo ? gc.ROUTE_WALK_ANIME_ON : gc.ROUTE_WALK_ANIME_OFF } );

			} else if( MOVE_STEP.includes( value ) ) { // [足踏みアニメON][足踏みアニメOFF]
				movementList.push( { code: paramNo ? gc.ROUTE_STEP_ANIME_ON : gc.ROUTE_STEP_ANIME_OFF } );

			} else if( MOVE_DIR_FIX.includes( value ) ) { // [向き固定ON][向き固定OFF]
				movementList.push( { code: paramNo ? gc.ROUTE_DIR_FIX_ON : gc.ROUTE_DIR_FIX_OFF } );

			} else if( MOVE_THROUGH.includes( value ) ) { // [すり抜けON][すり抜けOFF]
				movementList.push( { code: paramNo ? gc.ROUTE_THROUGH_ON : gc.ROUTE_THROUGH_OFF } );

			} else if( MOVE_INVISIBLE.includes( value ) ) { // [透明化ON][透明化OFF]
				movementList.push( { code: paramNo ? gc.ROUTE_TRANSPARENT_ON : gc.ROUTE_TRANSPARENT_OFF } );

			} else if( MOVE_VISIBLE.includes( value ) ) { // 透明化の逆
				movementList.push( { code: paramNo ? gc.ROUTE_TRANSPARENT_OFF : gc.ROUTE_TRANSPARENT_ON } );

			} else if( MOVE_CHENGE.includes( value ) ) { // キャラパターンの変更[画像の変更…]の代わり
				const result = opland.match( /([0-9-]*)(,([0-9-]*)(,([0-9-]*))?)?/ );
				if( result ) {
					movementList.push( { code: TF_CHANGE_CHAR, parameters: [ result[ 1 ], result[ 3 ], result[ 5 ] ] } );
				}
			}
		} );

		movementList.push( { code: gc.ROUTE_END } );
		this._params = [ eventId, { repeat: repeat, skippable: skippable, wait: wait, list: movementList } ];
		this.command205();	// SET_MOVEMENT_ROUTE
	}


	/**
	 * TF_MOVE_CHAR  の実行。
	 * 類似プラグイン
	 * 　移動ルート＋(https://w.atwiki.jp/pokotan/pages/3.html)
	 * 　移動ルート簡易記述関数プラグイン(https://ci-en.dlsite.com/creator/2449/article/122390)
	 *
	 * @param {Game_Character} targetEvent イベント・プレイヤー・フォロワーのいずれか
	 * @param {String} d キャラの向き(テンキー対応)
	 * @param {String} distance 移動距離(タイル数)
	 */
	function moveChar( targetEvent, d, distance ) {
		distance = parseFloatStrict( distance );// HalfMove.js 対応でparseFloatStrict()を使う
		d = stringToDirection( d );
		targetEvent.setDirection( convertD8to4( d ) );
		targetEvent._x = $gameMap.roundX( targetEvent._x + getDx( d ) * distance );
		targetEvent._y = $gameMap.roundY( targetEvent._y + getDy( d ) * distance );
	}


	/**
	 * TF_START_ANIME  の実行。
	 *
	 * @param {Game_Character} targetEvent イベント・プレイヤー・フォロワーのいずれか
	 */
	function startAnime( targetEvent ) {
		targetEvent.setThrough( true );
		targetEvent.TF_isAnime = true;
	}

	/**
	 * TF_END_ANIME  の実行。
	 *
	 * @param {Game_Character} targetEvent イベント・プレイヤー・フォロワーのいずれか
	 */
	function endAnime( targetEvent ) {
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
	 * TF_ANIME  の実行。
	 *
	 * @param {String} eventId イベントIDかそれに替わる識別子の文字列
	 * @param {String} mx x移動距離( 規定値: 0ピクセル )
	 * @param {String} my y移動距離( 規定値: 0ピクセル )
	 * @param {String} waitFrames 表示時間( 規定値: 3フレーム )
	 * @param {String} charaNo キャラクタ番号( 0~7 )
	 * @param {String} patternNo パターン番号( 0~2 )
	 * @param {String} d キャラの向き(テンキー対応)
	 */
	function anime( eventId, mx, my, waitFrames, charaNo, patternNo, d ) {
		eventId = stringToEventId( eventId );
		const targetEvent = getEventById( this, eventId );
		setCharPattern( targetEvent, undefined, charaNo, patternNo, d );
		targetEvent._realX += parseIntStrict( mx ) / $gameMap.tileWidth();
		targetEvent._realY += parseIntStrict( my ) / $gameMap.tileHeight();
		if( waitFrames === undefined ) {
			waitFrames = speedToFrames( targetEvent.moveSpeed() );
		} else {
			waitFrames = parseIntStrict( waitFrames );
		}
		const commandList = [
			{ indent: 0, code: WAIT_FOR, parameters: [ waitFrames ] },
			{ indent: 0, code: COMMAND_END }
		];
		this.setupChild( commandList, eventId );
	}

	/**
	 * TF_VD_ANIME  の実行。
	 * 
	 * @param {String} eventId イベントIDかそれに替わる識別子の文字列
	 * @param {String} fileName キャラクタファイル名( img/characters/ 以下)
	 * @param {String} charaNo キャラクタ番号( 0~7 )
	 * @param {String} patternNo パターン番号( 0~2 )
	 * @param {String} waitFrames 待ちフレーム数
	 */
	function vdAnime( eventId, fileName, charaNo, patternNo, waitFrames ) {
		eventId = stringToEventId( eventId );
		const targetEvent = getEventById( this, eventId );
		if( waitFrames === undefined ) {
			waitFrames = speedToFrames( targetEvent.moveSpeed() );
		} else {
			waitFrames = parseIntStrict( waitFrames );
		}
		setCharPattern( targetEvent, fileName, charaNo, patternNo );
		const tempDirectionFix = targetEvent.isDirectionFixed();
		targetEvent.setDirectionFix( false );
		this._params = [ eventId, {
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
	 * TF_VU_ANIME  の実行。
	 *
	 * @param {String} eventId イベントIDかそれに替わる識別子の文字列
	 * @param {String} fileName キャラクタファイル名( img/characters/ 以下)
	 * @param {String} charaNo キャラクタ番号( 0~7 )
	 * @param {String} patternNo パターン番号( 0~2 )
	 * @param {String} waitFrames 待ちフレーム数
	 */
	function vuAnime( eventId, fileName, charaNo, patternNo, waitFrames ) {
		eventId = stringToEventId( eventId );
		const targetEvent = getEventById( this, eventId );
		if( waitFrames === undefined ) {
			waitFrames = speedToFrames( targetEvent.moveSpeed() );
		} else {
			waitFrames = parseIntStrict( waitFrames );
		}
		setCharPattern( targetEvent, fileName, charaNo, patternNo );
		const tempDirectionFix = targetEvent.isDirectionFixed();
		targetEvent.setDirectionFix( false );
		this._params = [ eventId, {
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


	/*---- Game_CharacterBase ----*/
	/**
	 * TF_START_ANIME, TF_END_ANIME 対応。
	 */
	const _Game_CharacterBase_isMoving = Game_CharacterBase.prototype.isMoving;
	Game_CharacterBase.prototype.isMoving = function() {
		if( this.TF_isAnime ) return false;	// TF_isAnime フラグが true の場合、規定の移動処理を行わない。
		return _Game_CharacterBase_isMoving.call( this );
	};


	/*---- Game_Character ----*/
	const _Game_Character_processMoveCommand = Game_Character.prototype.processMoveCommand;
	Game_Character.prototype.processMoveCommand = function( command ) {
		_Game_Character_processMoveCommand.apply( this, arguments );
		if( !command ) return;

		const params = command.parameters;
		if( command.code === TF_MOVE_CHAR ) {
			this.TF_moveChar( ...params );
		} else if( command.code === TF_CHANGE_CHAR ) {
			setCharPattern( this, undefined, params[ 0 ], params[ 1 ], params[ 2 ] );
		};
	};

	// Game_Event と同様に Game_Player・Game_Follower にオリジナルパターン( _originalPattern )の変更機能をつける。
	// これにより歩行パターンを設定後、規定(1)のオリジナルパターンに戻ることを防ぐ。

	/*---- Game_Player ----*/
	const _Game_Player_initMembers = Game_Player.prototype.initMembers;
	Game_Player.prototype.initMembers = function() {
		_Game_Player_initMembers.call( this );
		this._originalPattern = 1;
	};
	Game_Player.prototype.isOriginalPattern = function() {
		return this.pattern() === this._originalPattern;
	};

	/*---- Game_Follower ----*/
	const _Game_Follower_initMembers = Game_Follower.prototype.initMembers;
	Game_Follower.prototype.initMembers = function() {
		_Game_Follower_initMembers.call( this );
		this._originalPattern = 1;
	};
	Game_Follower.prototype.isOriginalPattern = function() {
		return this.pattern() === this._originalPattern;
	};


	/**
	 * 4方向を右回転90して返す。
	 * @param {Number} d 方向(テンキー対応)
	 */
	function directionTurn90D_R( d ) {
		return ( d < 5 ) ? d * 2 : d - ( 10 - d );
	}
	/**
	 * 4方向を左回転90して返す。
	 * @param {Number} d 方向(テンキー対応)
	 */
	function directionTurn90D_L( d ) {
		return ( d < 5 ) ? d * 2 : d - ( 10 - d );
	}
	/**
	 * 8方向を4方向にして返す。
	 * @param {Number} d 方向(テンキー対応)
	 */
	function convertD8to4( d ) {
		const dy = getDy( d );
		return ( dy === -1 ) ? 8 : ( dy === 1 ) ? 2 : d;
	}
	/**
	 * 指定方向のX要素を返す。
	 * @param {Number} d 方向(テンキー対応)
	 */
	function getDx( d ) {
		const sidePattern = d % 3;
		return ( sidePattern === 0 ) ? 1 : ( sidePattern === 1 ) ? -1 : 0;
	}
	/**
	 * 指定方向のY要素を返す。
	 * @param {Number} d 方向(テンキー対応)
	 */
	function getDy( d ) {
		return ( d < 4 ) ? 1 : ( 6 < d ) ? -1 : 0;
	}
	/**
	 * [移動速度]をウェイトのフレーム数に変換して返す。
	 * @param {*} speed 
	 */
	function speedToFrames( speed ) {
		// speed 1: 1 / 8倍速, 2: 1 / 4倍速, 3: 1 / 2倍速, 4: 通常速, 5: 2倍速, 6: 4倍速
		return 128 >> speed;
	}
} )();