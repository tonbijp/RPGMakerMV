//========================================
// TF_CharEx.js
// Version :0.15.0.0
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
 * @author とんび@鳶嶋工房(tonbi.jp)
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
 * @param useIncreasedPattern
 * @desc GALV_CharacterFrames.js に対応し3以上のパターン番号を指定可能にする。ただし[キャラパターン]指定はできなくなる。
 * @type boolean
 * @default  false
 * @on 多パターン指定
 * @off 3パターン指定(規定値)
 * 
 * @help
 * 主な機能とイベントコマンドにない利点。規定値:現在値)
 * 
 * 1 : キャラ( イベント・プレイヤー・隊列メンバー )の位置・パターンの設定。
 * 　ピクセル単位の位置指定で、キャラの繊細なアニメーションができる。
 * 　歩行パターン別の指定で、キャラ素材を無駄なく利用できる。
 * 
 * 2 : 頻出するアニメーションの指定。
 * 　収録素材の宝箱などは、3列全て同じ素材が並んでいて無駄が多い。
 * 　歩行パターン別に指定可能なので、3パターン違う素材を置ける。
 *
 * 3 : キャラの[ルート移動]の簡易コマンドによる指定。
 * 　例えば[上に移動][上に移動][上に移動][上に移動]と指定が必要な場合、
 * 　↑4 と書けるので回数調整が容易で、全体の見通しが良い。
 *
 * 通常のイベントコマンドでは指定できない隊列メンバーを指定できる。
 *
 * 【プラグインコマンド】※ 規定値のある値は省略可能。
 * ------------------------------
 * TF_FILE_CHAR [イベントID] [画像ファイル名] [キャラ番号] [歩行パターン] [向き]
 * 　イベントコマンド[移動ルートの設定]に加え歩行パターンも指定。
 * 　[イベントID] 0:このイベント、-1:プレイヤー、-2〜-4:隊列メンバー
 * 　　　　　　　1〜:イベントID(規定値:0) ※下部詳細参照
 * 　[画像ファイル名] .pngを除いた img/character/ フォルダのファイル名
 * 　[キャラ番号] 画像の上段左から 0,１, 2, 3 、下段が 4, 5, 6, 7 となる番号
 * 　[歩行パターン] 3パターンアニメの左から 0, 1, 2(規定値:現在値)
 * 　[向き] 4方向の向き (規定値:2、[歩行パターン]指定がない時は現在値)
 *
 * 　例: TF_FILE_CHAR self !Door 2 0 D
 * ------------------------------
 * TF_FILE_CHAR [イベントID] [画像ファイル名] [キャラ番号] [キャラパターン]
 * 　[キャラパターン] は[歩行パターン] + [向き] を一度に指定する番号(規定値:現在値)
 * 　※下部詳細参照
 *
 * 　例: TF_FILE_CHAR player Animal 7 11
 * ------------------------------
 * TF_CHAR [イベントID] [キャラ番号] [歩行パターン] [向き]
 * TF_CHAR [イベントID] [キャラ番号] [キャラパターン]
 * 　TF_FILE_CHAR から[画像ファイル名]を抜いたコマンド。
 * ------------------------------
 * TF_LOCATE_XY [イベントID] [x] [y] [歩行パターン] [向き]
 * 　位置を設定。
 * 　[x] x位置(タイル数)
 * 　[y] y位置(タイル数)
 *
 * 　例: TF_LOCATE_XY モブおじさん 10 4 2 4
 * ------------------------------
 * TF_LOCATE_XY [イベントID] [x] [y] [キャラパターン]
 *
 * 　例: TF_LOCATE_XY モブおじさん 10 4 5
 * ------------------------------
 * TF_LOCATE_EV [イベントID] [目標イベントID] [dx] [dy] [歩行パターン] [向き]
 * 　[目標イベントID] 移動目標のイベントID
 * 　[dx] 目標イベントからの相対x座標(タイル数)
 * 　[dy] 目標イベントからの相対y座標(タイル数)
 *
 * 　例: TF_LOCATE_EV モブおじさん 10 4 5
 * ------------------------------
 * TF_LOCATE_EV [イベントID] [目標イベントID] [dx] [dy] [キャラパターン]
 * ------------------------------
 * TF_GO_XY [イベントID] [x] [y] [待つ]
 * 　指定座標に移動する。
 * 　TF_LOCATE_XY は瞬時に移動するが、こちらは徒歩。
 * 　障害物などで移動できないこともある。
 * 　[待つ] 真偽値(true:移動終了まで待つ false:待たない)(規定値:true)
 *
 * 　例: TF_GO_XY モブおじさん 10 4
 * ------------------------------
 * TF_GO_EV [イベントID] [目標イベントID] [dx] [dy] [待つ]
 * 　指定イベントの位置に移動する。
 * 　[dx] [dy] は省略可能(両者とも規定値:0)
 * 
 * 　例: TF_GO_EV モブおじさん バミリB
 * ------------------------------
 * TF_ROUTE [イベントID] [移動指定] [繰り返し] [飛ばす] [待つ]
 * 　イベントコマンドの[ルートの設定]を一行で書く。
 * 　[移動指定] 専用コマンド文字(例:←↓↑→)+数値の連続 ※下部詳細参照
 * 　[繰り返し] 指定した動作を繰り返すか(規定値:false)
 * 　[飛ばす] 移動できない場合は飛ばすか(規定値:true)
 *
 * 　例: TF_ROUTE this ↑4⤵︎5→3 OFF ON OFF
 * ------------------------------
 * TF_VD_ANIME [イベントID] [画像ファイル名] [キャラ番号] [歩行パターン] [ウェイト]
 * 　キャラ画像の縦下方向にアニメーションする(向きだと 左→右→上 の順)
 * 　収録素材の宝箱や扉のようなパターンに使う。
 * 　TF_ROUTE の[移動指定]で c0,2,2z4c0,2,4z4c0,2,6z4c0,2,8 と書ける。
 * 　[ウェイト] 表示時間(規定値:[移動速度]より算出)※下部詳細参照
 *
 * 　例:TF_VD_ANIME 2 !Door2 2 0
 * ------------------------------
 * TF_VU_ANIME [イベントID] [画像ファイル名] [キャラ番号] [歩行パターン] [ウェイト]
 * 　キャラ画像の縦上方向にアニメーションする。
 * 　(キャラの向きだと 右→左→下 の順)
 *
 * 　例:TF_VU_ANIME
 * ------------------------------
 * TF_VDEX_ANIME [イベントID] [画像ファイル名] [キャラ番号] [ウェイト]
 * 　キャラ画像のパターンと向きを全て使ってアニメーションする。
 * 　(キャラの向きだと 下→左→右→上 の順、向き毎に足踏みが画像左から右)
 * 　宝箱や扉のパターンをより滑らかに改造した時に使う。
 *
 * 　例:TF_VDEX_ANIME 2 !$SmoothDoor 0
 * ------------------------------
 * TF_VUEX_ANIME [イベントID] [画像ファイル名] [キャラ番号] [ウェイト]
 * 　キャラ画像のパターンと向きを全て使ってアニメーションする。
 * 　(キャラの向きだと 上→右→左→下 の順、向き毎に足踏みが画像左から右)
 *
 * 　例:TF_VUEX_ANIME 2 !$SmoothDoor 2 1
 * ------------------------------
 * TF_FOLLOW [隊列メンバーID] [フォロー状態]
 * 　プレイヤーを隊列メンバーが追跡するかどうか指定。
 * 　[隊列メンバーID] -2,-3,-4 あるいは follower0, follower1,follower2 の値。
 * 　　all を指定した場合、隊列メンバー全体に適用(規定値:all)
 * 　[フォロー状態] フォローするか(規定値:true)
 *
 * 　例: TF_FOLLOW all false
 * ------------------------------
 * TF_ANIME [イベントID] [mx] [my] [ウェイト] [キャラ番号] [歩行パターン] [向き]
 * 　アニメの指定。アニメモード(移動アニメ停止・[すり抜け]ON)になる。
 * 　[mx] x移動距離(規定値:0ピクセル)
 * 　[my] y移動距離(規定値:0ピクセル)
 * 
 * 　例: TF_ANIME -1 -4 8 12 0 0 6
 * ------------------------------
 * TF_ANIME [イベントID] [mx] [my] [ウェイト] [キャラ番号] [キャラパターン]
 * ------------------------------
 * TF_ANIME [イベントID] [mx] [my] [ウェイト] [キャラパターン]
 * 　[キャラ番号]は現在の番号になる。
 * ------------------------------
 * TF_END_ANIME [イベントID]
 * 　アニメモード(移動アニメ停止・[すり抜け]ON)の終了。
 * 　また、moveUnit パラメータに合わせて位置を調整する。
 * 　TF_ANIMEの指定が終わったら、これで通常に戻すこと。
 *
 * 　例: TF_END_ANIME this
 *
 * 
 * 【[移動ルートの設定]で使うスクリプト】
 * ------------------------------
 * this.TF_setCharPattern( [キャラ番号], [歩行パターン], [向き] )
 * キャラクタのパターンを指定
 * 
 * this.TF_goXY( [x], [y] );
 * 　指定座標に移動。
 * ------------------------------
 * this.TF_goEv( [目標イベントID], [dx], [dy] );
 * 　目標イベント位置に移動。
 * =========================
 * 
 * 【詳細】
 * ------------------------------
 * [イベントID] は数字の他、以下の文字が利用できる。
 * 　このイベント: this(またはself):
 * 　プレイヤー: player
 * 　隊列メンバー0: follower0
 * 　隊列メンバー1: follower1
 * 　隊列メンバー2: follower2
 * ------------------------------
 * [イベントID] は、イベントの[名前]でも指定できる。
 * ただし数値や 上記 this などと同じ名前、スペースの入った名前の指定不可。
 * ------------------------------
 * [向き]にはテンキーに対応した数字の他、以下の文字が利用できる。
 * 　上: up, u, north, n, ↑, 上, 北
 * 　左: left, l, west, w, ←, 左, 西
 * 　右: right, r, east, e, →, 右, 東
 * 　下: down, d, south, s, ↓, 下, 南
 * 　※大文字小文字の区別をしません。
 * ------------------------------
 * [キャラパターン]は歩行グラフィックの[歩行パターン]と[向き]を一度に指定。
 * 　0, 1, 2		<= 下向き(テンキー2)
 * 　3, 4, 5		<= 左向き(テンキー4)
 * 　6, 7, 8		<= 右向き(テンキー6)
 * 　9, 10, 11 <= 上向き(テンキー8)
 * 　※ただし[]。
 * ------------------------------
 * 移動速度を[ウェイト]に変換する場合以下のような対応となる。
 * 　1 / 8倍速 … 64フレーム
 * 　1 / 4倍速 … 32フレーム
 * 　1 / 2倍速 … 16フレーム
 * 　通常速 … 8フレーム
 * 　2倍速 … 4フレーム
 * 　4倍速 … 2フレーム
 * ------------------------------
 * 真偽値( true/false )を指定する値には、on/off も使える。
 * ------------------------------
 * [イベントID][画像ファイル名][キャラ番号][歩行パターン][向き] [キャラパターン]
 * [ウェイト][x][y][mx][my][移動指定][隊列メンバーID]の値は、
 * 全てV[n]の形式で変数を指定できる。
 *
 * 例 : TF_LOCATE_XY 0 V[1] V[2]
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
 * 　[スイッチ] : switch, h, ス
 * 　　コンマ( , )で区切って一つ目の数字はスイッチID。
 * 　　ふたつ目の数字が0の場合は[スイッチOFF…]、1で[スイッチON…]
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
 * 　TF_CHAR : change, c, 変
 * 　　コンマ( , )で区切って [キャラ番号],[歩行パターン],[向き] を数字で指定。
 * 　　標準のコマンド[画像の変更…]は数字だけで指定できないので、
 * 　　現在指定しているキャラ画像内での変更するコマンドを別に追加。
 * 　　[画像の変更…]はファイルとキャラの変更はできる。
 * 　　でも[歩行パターン][向き]の変更はできないので、むしろ高機能かも。
 * 　[不透明度の変更…] : opacity, o, 濁
 *　　0〜255 の間の数字。
 * 　[合成方法の変更…] : blendmode, m, 合
 * 　　0: 通常, 1: 加算, 2: 乗算, 3: スクリーン
 * 　TF_GO_XY( TF_GO_EV ) : go, @, 移
 * 　　コンマ( , )で区切って [x],[y] の座標に移動。
 * 　　数字がひとつだけの場合イベントIDとみなし、その位置に移動。
 */

( function() {
	'use strict';
	const WAIT_ROUTE = 'route';
	const WAIT_MOVING = 'moving';


	/*---- パラメータパース関数 ----*/
	const PARAM_TRUE = 'true';
	const PARAM_ON = 'on';
	const TYPE_BOOLEAN = 'boolean';
	const TYPE_NUMBER = 'number';
	const TYPE_STRING = 'string';
	/**
	 * 与えられた文字列に変数が指定されていたら、変数の内容に変換して返す。
	 * @param {String} value 変換元の文字列( v[n]形式を含む )
	 * @return {String} 変換後の文字列
	 */
	function treatValue( value ) {
		if( value === undefined || value === '' ) return '0';
		const result = value.match( /v\[(.+)\]/i );
		if( result === null ) return value;
		const id = parseInt( result[ 1 ], 10 );
		if( isNaN( id ) ) {
			return $gameVariables.valueByName( result[ 1 ] );
		} else {
			return $gameVariables.value( id );
		}
	}

	/*--- Game_Variables ---*/
	/**
	 * 変数を文字列で指定し、値を返す。
	 * @param {String} name 変数(ID, 名前, V[n]による指定が可能)
	 */
	Game_Variables.prototype.valueByName = function( name ) {
		return this.value( stringToVariableId( name ) );
	};
	/**
	 * 指定された変数のIDを返す。
	 * @param {String} name 変数(ID, 名前, V[n]による指定が可能)
	 */
	function stringToVariableId( name ) {
		name = treatValue( name );
		let i = $dataSystem.variables.findIndex( i => i === name );
		if( 0 <= i ) return i;
		i = parseInt( name, 10 );
		if( isNaN( i ) ) throw new Error( `I can't find the variable '${name}'` );
		return i;
	}

	/**
	 * 文字列を整数に変換して返す。
	 * @param {String|Number} value
	 * @return {Number} 数値に変換した結果
	 */
	function parseIntStrict( value ) {
		if( typeof value === TYPE_NUMBER ) return Math.floor( value );
		const result = parseInt( treatValue( value ), 10 );
		if( isNaN( result ) ) throw Error( '指定した値[' + value + ']が数値ではありません。' );
		return result;
	}

	/**
	 * 文字列を実数に変換して返す。
	 * @param {String|Number} value
	 * @return {Number} 数値に変換した結果
	 */
	function parseFloatStrict( value ) {
		if( typeof value === TYPE_NUMBER ) return value;
		const result = parseFloat( treatValue( value ) );
		if( isNaN( result ) ) throw Error( '指定した値[' + value + ']が数値ではありません。' );
		return result;
	}

	/**
	 * 文字列を真偽値に変換して返す。
	 * @param {String|Boolean} value 変換元文字列
	 * @returns {Boolean} 
	 */
	function parseBooleanStrict( value ) {
		if( typeof value === TYPE_BOOLEAN ) return value;
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
			if( !event ) return false;	// _events[0] が空なら無視
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
		if( typeof value === TYPE_NUMBER ) return value;
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

	const gc = Game_Character;


	/**
	 * パラメータを受け取る
	 */
	const pluginParams = PluginManager.parameters( 'TF_CharEx' );
	const TF_moveUnit = parseFloatStrict( pluginParams.moveUnit );
	const TF_useIncreasedPattern = parseBooleanStrict( pluginParams.useIncreasedPattern );


	/*---- Game_Interpreter ----*/
	const TF_FILE_CHAR = 'TF_FILE_CHAR';
	const TF_CHAR = 'TF_CHAR';
	const TF_LOCATE_XY = 'TF_LOCATE_XY';
	const TF_LOCATE_EV = 'TF_LOCATE_EV';
	const TF_GO_XY = 'TF_GO_XY';
	const TF_GO_EV = 'TF_GO_EV';
	const TF_ROUTE = 'TF_ROUTE';
	const TF_VD_ANIME = 'TF_VD_ANIME';
	const TF_VDEX_ANIME = 'TF_VDEX_ANIME';
	const TF_VU_ANIME = 'TF_VU_ANIME';
	const TF_VUEX_ANIME = 'TF_VUEX_ANIME';
	const TF_FOLLOW = 'TF_FOLLOW';
	const TF_ANIME = 'TF_ANIME';
	const TF_END_ANIME = 'TF_END_ANIME';
	/**
	 * プラグインコマンドの実行。
	 */
	const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function( command, args ) {
		_Game_Interpreter_pluginCommand.apply( this, arguments );

		const idToEv = ( id ) => getEventById( this, stringToEventId( id ) );
		const commandStr = command.toUpperCase();
		switch( commandStr ) {
			case TF_FILE_CHAR: setCharPattern( idToEv( args[ 0 ] ), args[ 1 ], args[ 2 ], args[ 3 ], args[ 4 ] ); break;
			case TF_CHAR: setCharPattern( idToEv( args[ 0 ] ), undefined, args[ 1 ], args[ 2 ], args[ 3 ] ); break;
			case TF_LOCATE_XY: locateXY( idToEv( args[ 0 ] ), args[ 1 ], args[ 2 ], args[ 3 ], args[ 4 ] ); break;
			case TF_LOCATE_EV: locateEv( idToEv( args[ 0 ] ), idToEv( args[ 1 ] ), args[ 2 ], args[ 3 ], args[ 4 ], args[ 5 ] ); break;
			case TF_GO_XY: goXY( idToEv( args[ 0 ] ), args[ 1 ], args[ 2 ], args[ 3 ] ); break;
			case TF_GO_EV: goEv( idToEv( args[ 0 ] ), idToEv( args[ 1 ] ), args[ 2 ], args[ 3 ], args[ 4 ] ); break;
			case TF_ROUTE: moveRoute( this, ...args ); break;
			case TF_VD_ANIME: vdAnime.apply( this, args ); break;
			case TF_VU_ANIME: vuAnime.apply( this, args ); break;
			case TF_VDEX_ANIME: vdexAnime.apply( this, args ); break;
			case TF_VUEX_ANIME: vuexAnime.apply( this, args ); break;
			case TF_FOLLOW: follow.apply( this, args ); break;
			case TF_ANIME: anime.apply( this, args ); break;
			case TF_END_ANIME: animeMode( idToEv( args[ 0 ] ), false ); break;
		}
	};

	/**
	 * [移動ルートの設定]ができない隊列メンバーに対して、
	 * TF_ROUTEを可能にする。
	 */
	const _Game_Interpreter_command205 = Game_Interpreter.prototype.command205;
	Game_Interpreter.prototype.command205 = function() {
		const params = this._params;
		// if( typeof params[ 0 ] === TYPE_STRING ) params[ 0 ] = stringToEventId( params[ 0 ] );
		if( -2 < params[ 0 ] ) return _Game_Interpreter_command205.call( this );

		$gameMap.refreshIfNeeded();
		this._character = getEventById( this, params[ 0 ] );
		if( !this._character ) return true;
		this._character.forceMoveRoute( params[ 1 ] );
		if( params[ 1 ].wait ) this.setWaitMode( WAIT_ROUTE );
		return true;
	};

	/**
	 * ウェイトモードに移動待ちを追加。
	 */
	const _Game_Interpreter_updateWaitMode = Game_Interpreter.prototype.updateWaitMode;
	Game_Interpreter.prototype.updateWaitMode = function() {
		if( this._waitMode === WAIT_MOVING ) {
			const waiting = this._character.isMoving();
			if( !waiting ) {
				this._waitMode = '';
			}
			return waiting;
		}
		return _Game_Interpreter_updateWaitMode.call( this );
	};


	/**
	 * setCharPattern() を呼び出す。
	 */
	Game_CharacterBase.prototype.TF_setCharPattern = function( charaNo, patternNo, d ) {
		setCharPattern( this, undefined, charaNo, patternNo, d );
	};

	/**
	 * goXY() を呼び出す。
	 */
	Game_Interpreter.prototype.TF_goXY = function( eventId, x, y ) {
		const targetEvent = getEventById( this, stringToEventId( eventId ) );
		goXY( targetEvent, x, y );
	};
	Game_CharacterBase.prototype.TF_goXY = function( x, y, isWait ) {
		goXY( this, x, y, isWait );
	};

	/**
	 * goEv() を呼び出す。
	 */
	Game_Interpreter.prototype.TF_goEv = function( eventId, destinationId, dx, dy ) {
		const targetEvent = getEventById( this, stringToEventId( eventId ) );
		const destinationEvent = getEventById( this, stringToEventId( destinationId ) );
		goEv( targetEvent, destinationEvent, dx, dy );
	};
	Game_CharacterBase.prototype.TF_goEv = function( destinationId, dx, dy, isWait ) {
		const destinationEvent = getEventById( this, stringToEventId( destinationId ) );
		goEv( this, destinationEvent, dx, dy, isWait );
	};


	/**
	 * TF_FILE_CHAR および TF_CHAR の実行。
	 *
	 * @param {Game_Character} targetEvent イベント・プレイヤー・隊列メンバーのいずれか
	 * @param {String} fileName キャラクタファイル名( img/characters/ 以下) (規定値: targetEventの指定)
	 * @param {String} charaNo キャラクタ番号( 0~7 )
	 * @param {String} patternNo パターン番号( 0~2 )
	 * @param {String} d キャラの向き(テンキー対応)
	 * @returns {Object} { id:{Number}, object:{Game_Character} }
	 */
	function setCharPattern( targetEvent, fileName, charaNo, patternNo, d ) {

		// 画像ファイル
		if( fileName === undefined || fileName === '' ) {
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
			if( !TF_useIncreasedPattern && 2 < patternNo ) {
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
	 * TF_LOCATE_XY  の実行。
	 *
	 * @param {Game_Character} targetEvent イベント・プレイヤー・隊列メンバーのいずれか
	 * @param {String} x x座標(タイル数)
	 * @param {String} y y座標(タイル数)
	 * @param {String} patternNo パターン番号( 0~2 )
	 * @param {String} d キャラの向き(テンキー対応)
	 */
	function locateXY( targetEvent, x, y, patternNo, d ) {
		if( patternNo ) {
			setCharPattern( targetEvent, undefined, undefined, patternNo, d );
		}
		targetEvent.setPosition( parseFloatStrict( x ), parseFloatStrict( y ) );// HalfMove.js 対応でparseFloatStrict()を使う
	}

	/**
	 * TF_LOCATE_EV  の実行。
	 *
	 * @param {Game_Character} targetEvent イベント・プレイヤー・隊列メンバーのいずれか
	 * @param {Game_Character} destinationEvent 目標イベント
	 * @param {String} dx 目標イベントからの相対x座標(タイル数)
	 * @param {String} dy 目標イベントからの相対y座標(タイル数)
	 * @param {String} patternNo パターン番号( 0~2 )
	 * @param {String} d キャラの向き(テンキー対応)
	 */
	function locateEv( targetEvent, destinationEvent, dx, dy, patternNo, d ) {
		const x = $gameMap.roundX( destinationEvent.x + parseFloatStrict( dx ) );
		const y = $gameMap.roundY( destinationEvent.y + parseFloatStrict( dy ) );
		locateXY( targetEvent, x, y, patternNo, d );
	}

	/**
	 * TF_GO_XY  の実行。
	 * 類似プラグイン
	 * 　移動ルート＋(https://w.atwiki.jp/pokotan/pages/3.html)
	 * 　移動ルート簡易記述関数プラグイン(https://ci-en.dlsite.com/creator/2449/article/122390)
	 *
	 * @param {Game_Character} targetEvent イベント・プレイヤー・隊列メンバーのいずれか
	 * @param {String} x x座標(タイル数)
	 * @param {String} y y座標(タイル数)
	 * @param {Boolean} isWait ウェイトモードか
	 */
	function goXY( targetEvent, targetX, targetY, isWait ) {
		const x = parseFloatStrict( targetX );
		const y = parseFloatStrict( targetY );
		targetEvent.turnTowardCharacter( { x: x, y: y } );
		targetEvent._x = x;
		targetEvent._y = y;

		isWait = ( isWait === undefined ) ? true : parseBooleanStrict( isWait );
		if( !isWait ) return;

		const interpreter = getInterpreterFromCharacter( targetEvent );
		interpreter.setWaitMode( WAIT_MOVING );
		interpreter._character = targetEvent;
	}

	/**
	 * TF_GO_EV  の実行。
	 *
	 * @param {Game_Character} targetEvent イベント・プレイヤー・隊列メンバーのいずれか
	 * @param {Game_Character} destinationEvent 目標イベント
	 * @param { String; } dx 目標イベントからの相対x座標( タイル数 )
	 * @param { String; } dy 目標イベントからの相対y座標( タイル数 )
	 * @param {Boolean} isWait ウェイトモードか
	 */
	function goEv( targetEvent, destinationEvent, dx, dy, isWait ) {
		const x = $gameMap.roundX( destinationEvent.x + parseFloatStrict( dx ) );
		const y = $gameMap.roundY( destinationEvent.y + parseFloatStrict( dy ) );
		goXY( targetEvent, x, y, isWait );
	}

	const TRIGGER_PARALLEL = 4;	// 並列処理
	/**
	 * 	イベントで使われているインタプリタを取り出す。
	 * @param {Game_Character} character 
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


	const MOVE_RANDOM = [ 'random', '&', '＆', '乱' ]; // [ランダムに方向転換][ランダムに移動]
	const MOVE_TWARD = [ 'tward', 't', '近' ]; // [プレイヤーの方を向く][プレイヤーに近づく]
	const MOVE_AWAY = [ 'away', 'y', '遠' ]; // [プレイヤーの逆を向く][プレイヤーから遠ざかる]
	const MOVE_FORWARD = [ 'front', 'forward', 'f', '前' ]; // [一歩前進]
	const MOVE_BACKWARD = [ 'back', 'backward', 'b', '後' ]; // [180度回転][一歩後退]
	const MOVE_JUMP = [ 'jump', 'j', '跳' ]; // [ジャンプ…]
	const MOVE_WAIT = [ 'wait', 'z', '待' ]; // [ウェイト…]
	const MOVE_TURN_90D_R = [ 'turnright', '>', '＞', '⤵︎' ]; // [ランダムに方向転換][右に90度回転]
	const MOVE_TURN_90D_L = [ 'turnleft', '<', '＜', '⤹', '⤴' ]; // [右か左に90度回転][左に90度回転]
	const MOVE_SWITCH = [ 'switch', 'h', 'ス' ]; // [スイッチON…][スイッチOFF…]
	const MOVE_SPEED = [ 'agility', 'a', '速' ]; // [移動速度の変更…]
	const MOVE_FREQ = [ 'freaqency', 'q', '頻' ]; // [移動頻度の変更…]
	const MOVE_WALK = [ 'walk', 'k', '歩' ]; // [歩行アニメON][歩行アニメOFF]
	const MOVE_STEP = [ 'step', 'p', '踏' ]; // [足踏みアニメON][足踏みアニメOFF]
	const MOVE_DIR_FIX = [ 'fix', 'x', '固' ]; // [向き固定ON][向き固定OFF]
	const MOVE_THROUGH = [ 'through', 'g', '抜' ]; // [すり抜けON][すり抜けOFF]
	const MOVE_INVISIBLE = [ 'invisible', 'i', '透' ]; // [透明化ON][透明化OFF]
	const MOVE_VISIBLE = [ 'visible', 'v', '示' ]; // 透明化の逆
	const MOVE_CHARA = [ 'change', 'c', '変' ]; // キャラパターンの変更 [画像の変更…]の代用
	const MOVE_OPACITY = [ 'opacity', 'o', '濁' ]; // [不透明度の変更…]
	const MOVE_BLEND_MODE = [ 'blendmode', 'm', '合' ]; // [合成方法の変更…]
	const MOVE_GO = [ 'go', '@', '移' ]; // TF_GO_XY(TF_GO_EV)
	// ROUTE_PLAY_SE
	// ROUTE_SCRIPT

	/**
	 * TF_ROUTE
	 * @param {Game_Interpreter} interpreter インタプリタ
	 * @param {String} eventId イベントIDかそれに替わる識別子の文字列
	 * @param {String} mml MML(Moving Macro Language) の文字列
	 * @param {String} repeat 繰り返すか(規定値:false)
	 * @param {String} skippable 移動できない場合とばすか(規定値:true)
	 * @param {String} wait 待つか(規定値:true)
	 */
	function moveRoute( interpreter, eventId, mml, repeat, skippable, wait ) {
		eventId = stringToEventId( eventId );
		const targetEvent = getEventById( interpreter, eventId );
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
				const result = opland.match( /([0-9.-]+),([0-9.-]+)/ );
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
				const result = opland.match( /([0-9]+),([01])/ );
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

			} else if( MOVE_CHARA.includes( value ) ) { // キャラパターンの変更[画像の変更…]の代わり
				const result = opland.match( /([0-7]+)(,([0-9]+)(,([2468]))?)?/ );
				if( result ) {
					movementList.push( { code: TF_CHAR, parameters: [ result[ 1 ], result[ 3 ], result[ 5 ] ] } );
				}

			} else if( MOVE_OPACITY.includes( value ) ) { // [不透明度の変更…]
				movementList.push( { code: gc.ROUTE_CHANGE_OPACITY, parameters: [ paramNo ] } );

			} else if( MOVE_BLEND_MODE.includes( value ) ) { // [合成モードの設定…]
				movementList.push( { code: gc.ROUTE_CHANGE_BLEND_MODE, parameters: [ paramNo ] } );

			} else if( MOVE_GO.includes( value ) ) { // TF_GO_XY
				const result = opland.match( /([0-9.]+),([0-9.]+)/ );
				let x, y;
				if( result === null ) {
					const destinationEvent = getEventById( interpreter, paramNo );
					x = destinationEvent.x;
					y = destinationEvent.y;
				} else {
					x = Boolean( result[ 1 ] ) ? parseFloat( result[ 1 ] ) : 0;
					y = Boolean( result[ 2 ] ) ? parseFloat( result[ 2 ] ) : 0;
				}
				movementList.push( { code: TF_GO_XY, parameters: [ x, y ] } );
			}
		} );

		movementList.push( { code: gc.ROUTE_END } );
		interpreter._params = [ eventId, { repeat: repeat, skippable: skippable, wait: wait, list: movementList } ];
		interpreter.command205();	// SET_MOVEMENT_ROUTE
	}



	/**
	 * TF_FOLLOW の実行。
	 *
	 * @param {String} followerId 隊列メンバーID(規定値:all)
	 * @param {String|Boolean} isFollow プレイヤーを追跡するか(規定値:true)
	 */
	function follow( followerId, isFollow ) {
		if( followerId === undefined || followerId.toLowerCase() === 'all' ) {
			const followers = $gamePlayer.followers();
			followers.forEach( follower => {
				followMode( follower, isFollow );
			} );
		} else {
			const id = stringToEventId( followerId );
			if( -5 < id && id < -1 ) {
				followMode( getEventById( this, id ), isFollow );
			} else {
				throw Error( `[${followerId}]は隊列メンバーのIDではありません。` );
			}
		}
	}

	/**
	 * フォロー状態の設定。
	 *
	 * @param {Game_Follower} targetEvent 隊列メンバーのいずれか
	 * @param {String|Boolean} isFollow プレイヤーを追跡するか(規定値:true)
	 */
	function followMode( targetEvent, isFollow ) {
		isFollow = ( isFollow === undefined ) ? true : parseBooleanStrict( isFollow );
		targetEvent.TF_isFollow = isFollow;
		if( isFollow ) return;
	}

	/**
	 * アニメモードの設定。
	 * isAnime が false の場合が TF_END_ANIME の内容。
	 *
	 * @param {Game_Character} targetEvent イベント・プレイヤー・隊列メンバーのいずれか
	 * @param {String|Boolean} isAnime アニメモードか(規定値:false)
	 */
	function animeMode( targetEvent, isAnime ) {
		isAnime = parseBooleanStrict( isAnime );
		targetEvent.setThrough( isAnime );
		targetEvent.TF_isAnime = isAnime;
		if( isAnime ) return;

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
		if( !targetEvent.TF_isAnime ) animeMode( targetEvent, true );
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
	 * TF_VDEX_ANIME  の実行。
	 * 
	 * @param {String} eventId イベントIDかそれに替わる識別子の文字列
	 * @param {String} fileName キャラクタファイル名( img/characters/ 以下)
	 * @param {String} charaNo キャラクタ番号( 0~7 )
	 * @param {String} waitFrames 待ちフレーム数
	 */
	function vdexAnime( eventId, fileName, charaNo, waitFrames ) {
		eventId = stringToEventId( eventId );
		const targetEvent = getEventById( this, eventId );
		if( waitFrames === undefined ) {
			waitFrames = speedToFrames( targetEvent.moveSpeed() );
		} else {
			waitFrames = parseIntStrict( waitFrames );
		}

		setCharPattern( targetEvent, fileName, charaNo, 0, 2 );
		const tempDirectionFix = targetEvent.isDirectionFixed();
		targetEvent.setDirectionFix( false );
		this._params = [ eventId, {
			repeat: false, skippable: true, wait: true, list: [
				{ code: TF_CHAR, parameters: [ charaNo, 1, 2 ] },
				{ code: gc.ROUTE_WAIT, parameters: [ waitFrames ] },
				{ code: TF_CHAR, parameters: [ charaNo, 2, 2 ] },
				{ code: gc.ROUTE_WAIT, parameters: [ waitFrames ] },
				{ code: TF_CHAR, parameters: [ charaNo, 0, 4 ] },
				{ code: gc.ROUTE_WAIT, parameters: [ waitFrames ] },
				{ code: TF_CHAR, parameters: [ charaNo, 1, 4 ] },
				{ code: gc.ROUTE_WAIT, parameters: [ waitFrames ] },
				{ code: TF_CHAR, parameters: [ charaNo, 2, 4 ] },
				{ code: gc.ROUTE_WAIT, parameters: [ waitFrames ] },
				{ code: TF_CHAR, parameters: [ charaNo, 0, 6 ] },
				{ code: gc.ROUTE_WAIT, parameters: [ waitFrames ] },
				{ code: TF_CHAR, parameters: [ charaNo, 1, 6 ] },
				{ code: gc.ROUTE_WAIT, parameters: [ waitFrames ] },
				{ code: TF_CHAR, parameters: [ charaNo, 2, 6 ] },
				{ code: gc.ROUTE_WAIT, parameters: [ waitFrames ] },
				{ code: TF_CHAR, parameters: [ charaNo, 0, 8 ] },
				{ code: gc.ROUTE_WAIT, parameters: [ waitFrames ] },
				{ code: TF_CHAR, parameters: [ charaNo, 1, 8 ] },
				{ code: gc.ROUTE_WAIT, parameters: [ waitFrames ] },
				{ code: TF_CHAR, parameters: [ charaNo, 2, 8 ] },
				{ code: tempDirectionFix ? gc.ROUTE_DIR_FIX_ON : gc.ROUTE_DIR_FIX_OFF },
				{ code: gc.ROUTE_END }
			]
		} ];
		this.command205();	// SET_MOVEMENT_ROUTE
	}
	/**
	 * TF_VUEX_ANIME  の実行。
	 * 
	 * @param {String} eventId イベントIDかそれに替わる識別子の文字列
	 * @param {String} fileName キャラクタファイル名( img/characters/ 以下)
	 * @param {String} charaNo キャラクタ番号( 0~7 )
	 * @param {String} waitFrames 待ちフレーム数
	 */
	function vuexAnime( eventId, fileName, charaNo, waitFrames ) {
		eventId = stringToEventId( eventId );
		const targetEvent = getEventById( this, eventId );
		if( waitFrames === undefined ) {
			waitFrames = speedToFrames( targetEvent.moveSpeed() );
		} else {
			waitFrames = parseIntStrict( waitFrames );
		}
		setCharPattern( targetEvent, fileName, charaNo, 2, 8 );
		const tempDirectionFix = targetEvent.isDirectionFixed();
		targetEvent.setDirectionFix( false );
		this._params = [ eventId, {
			repeat: false, skippable: true, wait: true, list: [
				{ code: TF_CHAR, parameters: [ charaNo, 1, 8 ] },
				{ code: gc.ROUTE_WAIT, parameters: [ waitFrames ] },
				{ code: TF_CHAR, parameters: [ charaNo, 0, 8 ] },
				{ code: gc.ROUTE_WAIT, parameters: [ waitFrames ] },
				{ code: TF_CHAR, parameters: [ charaNo, 2, 6 ] },
				{ code: gc.ROUTE_WAIT, parameters: [ waitFrames ] },
				{ code: TF_CHAR, parameters: [ charaNo, 1, 6 ] },
				{ code: gc.ROUTE_WAIT, parameters: [ waitFrames ] },
				{ code: TF_CHAR, parameters: [ charaNo, 0, 6 ] },
				{ code: gc.ROUTE_WAIT, parameters: [ waitFrames ] },
				{ code: TF_CHAR, parameters: [ charaNo, 2, 4 ] },
				{ code: gc.ROUTE_WAIT, parameters: [ waitFrames ] },
				{ code: TF_CHAR, parameters: [ charaNo, 1, 4 ] },
				{ code: gc.ROUTE_WAIT, parameters: [ waitFrames ] },
				{ code: TF_CHAR, parameters: [ charaNo, 0, 4 ] },
				{ code: TF_CHAR, parameters: [ charaNo, 2, 2 ] },
				{ code: gc.ROUTE_WAIT, parameters: [ waitFrames ] },
				{ code: TF_CHAR, parameters: [ charaNo, 1, 2 ] },
				{ code: gc.ROUTE_WAIT, parameters: [ waitFrames ] },
				{ code: TF_CHAR, parameters: [ charaNo, 0, 2 ] },
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
	};


	/*---- Game_CharacterBase ----*/
	/**
	 * TF_START_ANIME, TF_END_ANIME 対応。
	 * TF_isAnime フラグが true の場合、規定の移動処理を行わない。
	 */
	const _Game_CharacterBase_isMoving = Game_CharacterBase.prototype.isMoving;
	Game_CharacterBase.prototype.isMoving = function() {
		if( this.TF_isAnime ) return false;
		return _Game_CharacterBase_isMoving.call( this );
	};


	/*---- Game_Character ----*/
	const _Game_Character_processMoveCommand = Game_Character.prototype.processMoveCommand;
	Game_Character.prototype.processMoveCommand = function( command ) {
		_Game_Character_processMoveCommand.apply( this, arguments );
		if( !command ) return;

		const params = command.parameters;
		switch( command.code ) {
			case TF_CHAR: setCharPattern( this, undefined, params[ 0 ], params[ 1 ], params[ 2 ] ); break;
			case TF_GO_XY: this.TF_goXY( ...params ); break;
		}
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
		this.TF_isFollow = true;
	};

	Game_Follower.prototype.isOriginalPattern = function() {
		return this.pattern() === this._originalPattern;
	};

	/**
	 * TF_isFollow が false か、TF_isAnime フラグが true の時は
	 * プレイヤーを追わない。
	 */
	const _Game_Follower_chaseCharacter = Game_Follower.prototype.chaseCharacter;
	Game_Follower.prototype.chaseCharacter = function( character ) {
		if( !this.TF_isFollow || this.TF_isAnime ) return false;
		_Game_Follower_chaseCharacter.apply( this, arguments );
	};

	/**
	 * 隊列メンバーはプレイヤーのデータをコピーしているが、
	 * TF_isFollow が false の時はコピーしない。
	 */
	const _Game_Follower_update = Game_Follower.prototype.update;
	Game_Follower.prototype.update = function() {
		if( this.TF_isFollow ) {
			_Game_Follower_update.call( this );
		} else {
			Game_Character.prototype.update.call( this );
		}
	};


	/*---- Game_Followers ----*/
	/**
	 * TF_isFollow が false か、TF_isFollow フラグが true の時は
	 * プレイヤーに同期してジャンプしない。
	 */
	const _Game_Followers_jumpAll = Game_Followers.prototype.jumpAll;
	Game_Followers.prototype.jumpAll = function() {
		if( !$gamePlayer.isJumping() ) return;

		for( var i = 0; i < this._data.length; i++ ) {
			const follower = this._data[ i ];
			if( !follower.TF_isFollow || follower.TF_isAnime ) continue;
			const sx = $gamePlayer.deltaXFrom( follower.x );
			const sy = $gamePlayer.deltaYFrom( follower.y );
			follower.jump( sx, sy );
		}
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