//========================================
// TF_Core
// Version :0.0.0.0 
// For : RPGツクールMV (RPG Maker MV)
// -----------------------------------------------
// Copyright : Tobishima-Factory 2020
// Website : http://tonbi.jp
//
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//========================================
/*:
 * 
 * @help
 * プラグインで共通して使っている処理をメモ的にまとめたもので、
 * 
 * 利用規約 : MITライセンス
 */

( function() {
    'use strict';



    /*---- パラメータパース関数 ----*/
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

    /*---- 移動関連関数 ----*/
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


