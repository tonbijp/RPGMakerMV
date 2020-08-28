//========================================
// TF_Core
// Version :0.2.1.1
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
 * プラグインで共通して使っている処理をメモ的にまとめたもの。
 * これをライブラリとして必要とするプラグインなどを作る予定はない。
 *
 * ============= この長さに合わせるとヘルプではみ出ない ==============
 * 利用規約 : MITライセンス
 */

( function() {
    'use strict';
    const PLUGIN_NAME = 'TF_Core';

    // HalfMove.js の確認
    const hasHalfMove = PluginManager._scripts.includes( 'HalfMove' );

    /**
     * パラメータを受け取る
     */
    const TF = ( () => {
        const parameters = PluginManager.parameters( PLUGIN_NAME );
        return JSON.parse( JSON.stringify(
            parameters,
            ( key, value ) => {
                try { return JSON.parse( value ); } catch( e ) { }
                return value;
            }
        ) );
    } )();

    /*---- パラメータパース関数 ----*/
    const PARAM_TRUE = 'true';
    const PARAM_ON = 'on';
    const TYPE_BOOLEAN = 'boolean';
    const TYPE_NUMBER = 'number';
    const TYPE_STRING = 'string';
    /**
     * 与えられた文字列に変数が指定されていたら、変数の内容に変換して返す。
     * @param {String} value 変換元の文字列( v[n]、s[n]形式を含む )
     * @return {String} 変換後の文字列
     */
    function treatValue( value ) {
        if( value === undefined || value === '' ) return '0';

        const varResult = value.match( /^v\[(.+)\]$/i );
        if( varResult !== null ) {
            const id = parseInt( varResult[ 1 ], 10 );
            if( isNaN( id ) ) {
                return $gameVariables.valueByName( varResult[ 1 ] );
            } else {
                return $gameVariables.value( id );
            }
        }

        const swResult = value.match( /^s\[(.+)\]$/i );
        if( swResult !== null ) {
            const id = parseInt( swResult[ 1 ], 10 );
            if( isNaN( id ) ) {
                return $gameSwitches.valueByName( swResult[ 1 ] );
            } else {
                return $gameSwitches.value( id );
            }
        }

        return value;
    }

	/**
	 * 文字列を整数に変換して返す。
	 * @param {String|Number} value
	 * @return {Number} 数値に変換した結果
	 */
    function parseIntStrict( value ) {
        if( typeof value === TYPE_NUMBER ) return Math.floor( value );
        const result = parseInt( treatValue( value ), 10 );
        if( isNaN( result ) ) throw Error( `Value '${value}' is not a number.` );
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
        if( isNaN( result ) ) throw Error( `Value '${value}' is not a number.` );
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
    const EVENT_HERE = 'here';
    const EVENT_PLAYER = 'player';
    const EVENT_FOLLOWER0 = 'follower0';
    const EVENT_FOLLOWER1 = 'follower1';
    const EVENT_FOLLOWER2 = 'follower2';
	/**
	 * 文字列をイベントIDへ変換。
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
        if( i === -1 ) throw Error( `I can't find the event '${value}'` );
        return i;
    }

	/**
	 * 文字列をマップIDへ変換。
	 * @param {String} value マップIDの番号か識別子( here か this で現在のマップ)
	 * @returns {Number} マップID 
	 */
    function stringToMapId( value ) {
        value = treatValue( value );

        const label = value.toLowerCase();
        if( label === EVENT_THIS || label === EVENT_HERE ) return $gameMap.mapId();

        const i = $dataMapInfos.findIndex( e => {
            if( !e ) return false;
            return e.name === value;
        } );
        if( i !== -1 ) return i; // $dataMapInfos[ i ].id が正しい気がするが、実は使われていないようだ
        const result = parseInt( value, 10 );
        if( isNaN( result ) ) throw Error( `I can't find the map '${value}'` );
        return result;
    }


    const DIRECTION_MAP = [
        { in: [ '↙︎', 'dl', 'sw', 'downleft', 'southwest' ], out: 1 },
        { in: [ '↓', 'd', 's', 'down', 'south' ], out: 2 },
        { in: [ '↘︎', 'dr', 'se', 'downright', 'southeast' ], out: 3 },
        { in: [ '←', 'l', 'w', 'left', 'west' ], out: 4 },
        { in: [ '→', 'r', 'e', 'right', 'east' ], out: 6 },
        { in: [ '↖︎', 'ul', 'nw', 'upleft', 'northwest' ], out: 7 },
        { in: [ '↑', 'u', 'n', 'up', 'north' ], out: 8 },
        { in: [ '↗︎', 'ur', 'ne', 'upright', 'northeast' ], out: 9 }
    ];
	/**
     * 方向文字列をテンキー方向の数値に変換して返す。
     * @param {String} value 方向た文字列
     * @returns {Number} テンキー方向の数値(変換できなかった場合:undefined)
     */
    function stringToDirection( value ) {
        if( typeof value === TYPE_NUMBER ) return value;
        value = treatValue( value );
        const result = parseInt( value, 10 );
        if( !isNaN( result ) ) return result;

        value = value.toLowerCase();
        const index = DIRECTION_MAP.findIndex( e => e.in.includes( value ) );
        if( index === -1 ) return;
        return DIRECTION_MAP[ index ].out;
    }


    const TRIGGER_PARALLEL = 4;	// 並列処理
	/**
	 * 	イベントで使われているインタプリタを取り出す。
	 * @param {Game_Character} character 
	 */
    function getInterpreterFromCharacter( character ) {
        let interpreter = ( character._trigger === TRIGGER_PARALLEL ) ? character._interpreter : $gameMap._interpreter;
        while( interpreter._childInterpreter ) interpreter = interpreter._childInterpreter;
        return interpreter;
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


    /*--- Game_Variables ---*/
    /**
     * 変数を文字列で指定し、値を返す。
     * @param {String} name 変数(ID, 名前, V[n]による指定が可能)
     */
    Game_Variables.prototype.valueByName = function( name ) {
        return this.value( stringToVariableId( name ) );
    };
    /**
     * 変数を文字列で指定し、値を設定。
     * @param {String} name 変数(ID, 名前, V[n]による指定が可能)
     * @param {String} value 設定する値
     */
    Game_Variables.prototype.setValueByName = function( name, value ) {
        this.setValue( stringToVariableId( name ), value );
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
        if( isNaN( i ) ) throw Error( `I can't find the variable '${name}'` );
        return i;
    }


    /*--- Game_Switches ---*/
    /**
     * スイッチの内容を文字列で指定して返す
     * @param {String} name スイッチ(ID, 名前, V[n]による指定が可能)
     */
    Game_Switches.prototype.valueByName = function( name ) {
        return this.value( stringToSwitchId( name ) );
    };
    /**
     * スイッチの内容を文字列で指定して設定
     * @param {String} name スイッチ(ID, 名前, V[n]による指定が可能)
     * @param {String} value 設定する値(
     */
    Game_Switches.prototype.setValueByName = function( name, value ) {
        this.setValue( stringToSwitchId( name ), value );
    };
    /**
     * 指定されたスイッチのIDを返す
     * @param {String} name スイッチ(ID, 名前, V[n]による指定が可能)
     */
    function stringToSwitchId( name ) {
        name = treatValue( name );
        let i = $dataSystem.switches.findIndex( i => i === name );
        if( 0 <= i ) return i;
        i = parseInt( name, 10 );
        if( isNaN( i ) ) throw Error( `I can't find the switche '${name}'` );
        return i;
    }

    /*---- Game_Interpreter ----*/
    /**
     * プラグインコマンドの実行
     */
    const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function( command, args ) {
        _Game_Interpreter_pluginCommand.apply( this, arguments );

        const commandStr = command.toUpperCase();
        // コマンド文字列による分岐
    };

} )();