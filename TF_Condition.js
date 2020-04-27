//========================================
// TF_Condition.js
// Version :0.1.0.0
// For : RPGツクールMV (RPG Maker MV)
// -----------------------------------------------
// Copyright : Tobishima-Factory 2020
// Website : http://tonbi.jp
//
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//========================================
/*:ja
 * @plugindesc 条件判定関連のスクリプト
 * @author とんび@鳶嶋工房
 * 
 * @help
 * 変数・スイッチ・セルフスイッチをIDだけでなく[名前]で設定できる。
 * そのため、制作途中でIDを変えても[名前]が同じなら大丈夫。
 * プレイヤー位置・前方のイベントなどの判定ができる。
 * 
 *
 *------------------------------
 * TF_VAR [変数ID] [変数への設定値]
 * 　変数の値を設定。
 * 　[変数ID] 変数を ID、名前、変数V[n] のいずれかで指定
 * 　[変数への設定値] 設定値
 *
 * 例: TF_VAR シーン 10
 *------------------------------
 * [スクリプト] $gameVariables.setValueByName( [変数ID], [変数への設定値] )
 *------------------------------
 * TF_VAR [変数ID]
 * 　変数の値を、指定ID(規定値:1)の変数に設定。
 *
 * 例: TF_VAR 石を叩いた回数
 *------------------------------
 * [スクリプト] $gameVariables.valueByName( [変数ID] )
 *------------------------------
 * TF_SW [スイッチID] [スイッチ状態]
 * 　スイッチを設定
 * 　[スイッチID] スイッチを ID、名前、変数V[n] のいずれかで指定
 * 　[スイッチ状態] true/false または ON/OFF で設定
 *
 * 例: TF_SW 賢者に会った ON
 *------------------------------
 * [スクリプト] $gameSwitches.setValueByName( [スイッチID], [スイッチ状態(真偽値)] )
 *------------------------------
 * TF_SW [スイッチID]
 * 　スイッチの値を、指定ID(規定値:1)のスイッチに設定。
 *
 * 例: TF_SW クイーンビーを倒した
 *------------------------------
 * [スクリプト] $gameSwitches.valueByName( [スイッチID] )
 *------------------------------
 * TF_SW_AND [スイッチID]...
 * 　複数のスイッチの値の論理積(AND)の結果を、指定ID(規定値:1)のスイッチに設定。
 * 
 * 例: TF_SW 森の妖精 岩場の妖精 湖の妖精 丘の妖精
 *------------------------------
 * [スクリプト]  $gameSwitches.MultipleAnd( [スイッチID]... )
 *------------------------------
 * TF_SELF_SW [イベントID] [スイッチタイプ] [スイッチ状態]
 * 　同マップ内のイベントのセルフスイッチを設定。
 * 　[イベントID] 0:このイベント、-1:プレイヤー、1〜:イベントID(規定値:0)
 * 　　this(またはself):このイベント、player:プレイヤー
 * 　　イベントの[名前]で指定(上記の数値や this などと同じ名前、およびスペースの入った名前は指定できません)
 * 　[スイッチタイプ] A, B, C, D のいずれか
 * 
 * 例: TF_SELF_SW 1F:西スイッチ A true
 *------------------------------
 * TF_SELF_SW [イベントID] [スイッチタイプ]
 * 　イベントのセルフスイッチの値を、指定ID(規定値:1)のスイッチに設定。
 * 
 * 例: TF_SELF_SW 石像 A
 *------------------------------
 * TF_FRONT_EVENT [マップID] [イベントID] [論理演算子]
 * 　プレイヤー前方に指定のイベントがあるかをチェックして結果を、指定ID(規定値:1)のスイッチに設定。
 * 　(今の所、HalfMove.js を使ってる前提で作ってます)
 * 　[マップID]  マップID | マップ名 | self | this
 * 　[論理演算子] 指定ID(規定値:1)のスイッチ と比較する 論理演算子( logical operator )による接続( & | | | and | or )
 *------------------------------
 * [スクリプト] this.TF_frontEvent( [マップID], [イベントID], [論理演算子] )
 *------------------------------
 * TF_CHECK_LOCATION [マップID] [x] [y] [向き] [論理演算子]
 * 　プレイヤーの座標位置と向きをチェックして合致して結果を、指定ID(規定値:1)のスイッチに設定。
 * 　(半歩移動を使っている場合は0.5単位で考慮)
 * 　[x] 対象x座標(タイル数)
 * 　[y] 対象y座標(タイル数)
 * 　[向き] プレイヤーの向き(テンキー対応 | 方向文字列)
 *------------------------------
 * [スクリプト] this.TF_checkLocation( [マップID], [x], [y], [向き], [論理演算子] )
 *------------------------------
 */

( function() {
	'use strict';
	const PARAM_TRUE = 'true';
	const PARAM_ON = 'on';
	const OPE_AND = 'and';
	const OPE_OR = 'or';
	const OPE_AND_MARK = '&';
	const OPE_OR_MARK = '|';


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
	 * @param {String} value 変換元文字列
	 * @return {Number} 整数値への変換結果
	 */
	function parseIntStrict( value ) {
		const result = parseInt( treatValue( value ), 10 );
		if( isNaN( result ) ) throw Error( '指定した値[' + value + ']が数値ではありません。' );
		return result;
	};

	/**
	 * @param {String} value 変換元文字列
	 * @return {Number} 数値への変換結果
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
		const result = treatValue( value ).toLowerCase();
		return ( result === PARAM_TRUE || result === PARAM_ON );
	}

	/**
	 * 
	 * @param {String} logope 
	 */
	function shortCircuit( logope ) {
		if( logope === undefined ) return;

		logope = logope.toLowerCase();
		if( logope === OPE_AND_MARK || logope === OPE_AND ) {
			if( !$gameSwitches.value( 1 ) ) return false;
		} else if( logope === OPE_OR_MARK || logope === OPE_OR ) {
			if( $gameSwitches.value( 1 ) ) return true;
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

		const label = value.toLowerCase();
		switch( label ) {
			case EVENT_THIS:
			case EVENT_SELF: return 0;
			case EVENT_PLAYER: return -1;
			case EVENT_FOLLOWER0: return -2;
			case EVENT_FOLLOWER1: return -3;
			case EVENT_FOLLOWER2: return -4;
		}
		// イベント名で指定できるようにする
		const i = $gameMap._events.findIndex( e => {
			if( e === undefined ) return false;	// _events[0] が undefined なので無視
			return $dataMap.events[ e._eventId ].name === value;
		} );
		if( i !== -1 ) return i;

		const result = parseInt( value, 10 );
		if( !isNaN( result ) ) return result;
		throw Error( `指定したイベント[${value}]がありません。` );
	}

	/**
	 * 文字列をマップIDへ変換
	 * @param {String} value マップIDの番号か識別子
	 * @returns {Number} マップID
	 */
	function stringToMapId( value ) {
		value = treatValue( value );

		const label = value.toLowerCase();
		if( label === EVENT_THIS || label === EVENT_SELF ) return $gameMap.mapId();

		const i = $dataMapInfos.findIndex( e => {
			if( !e ) return false;
			return e.name === value;
		} );
		if( i !== -1 ) return i; // $dataMapInfos[ i ].id が正しい気がするが、実は使われていないようだ
		const result = parseInt( value, 10 );
		if( isNaN( result ) ) throw Error( `指定したマップ[${value}]がありません。` );
		return result;
	}

	const DIRECTION_UP = [ 'up', 'u', 'north', 'n', 'back', 'b' ];
	const DIRECTION_LEFT = [ 'left', 'l', 'west', 'w' ];
	const DIRECTION_RIGHT = [ 'right', 'r', 'east', 'e' ];
	const DIRECTION_DOWN = [ 'down', 'd', 'south', 's', 'front', 'forward', 'f' ];
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
		if( DIRECTION_DOWN.includes( value ) ) return 2;
		if( DIRECTION_LEFT.includes( value ) ) return 4;
		if( DIRECTION_RIGHT.includes( value ) ) return 6;
		if( DIRECTION_UP.includes( value ) ) return 8;
	}



	/*---- Game_Interpreter ----*/
	const TF_VAR = 'TF_VAR';
	const TF_SW = 'TF_SW';
	const TF_SELF_SW = 'TF_SELF_SW';
	const TF_SW_AND = 'TF_SW_AND';
	const TF_CHECK_LOCATION = 'TF_CHECK_LOCATION';
	const TF_FRONT_EVENT = 'TF_FRONT_EVENT';

	/**
	 * プラグインコマンドの実行
	 */
	const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function( command, args ) {
		_Game_Interpreter_pluginCommand.apply( this, arguments );

		const commandStr = command.toUpperCase();
		if( commandStr === TF_VAR ) {
			if( args[ 1 ] === undefined ) {
				$gameVariables.setValue( 1, $gameVariables.valueByName( args[ 0 ] ) );
			} else {
				$gameVariables.setValueByName( args[ 0 ], args[ 1 ] );
			}
		} else if( commandStr === TF_SW ) {
			if( args[ 1 ] === undefined ) {
				$gameSwitches.setValue( 1, $gameSwitches.valueByName( args[ 0 ] ) );
			} else {
				$gameSwitches.setValueByName( args[ 0 ], args[ 1 ] );
			}
		} else if( commandStr === TF_SELF_SW ) {
			setSelfSwitch.apply( this, args );
		} else if( commandStr === TF_SW_AND ) {
			$gameSwitches.setValue( 1, $gameSwitches.MultipleAnd( ...args ) );
		} else if( commandStr === TF_FRONT_EVENT ) {
			$gameSwitches.setValue( 1, this.TF_frontEvent( ...args ) );
		} else if( commandStr === TF_CHECK_LOCATION ) {
			$gameSwitches.setValue( 1, this.TF_checkLocation( ...args ) );
		};
	};

	/**
	 * プレイヤー前方に指定イベントがあるか。
	 * @param {String} mapId マップID | マップ名 | self | this
	 * @param {String} eventId 対象イベント
	 * @param {String} logope 前の結果との論理演算子( logical operator )による接続( & | | | and | or )
	 * @returns {Boolean} 指定イベントがあるか
	 */
	Game_Interpreter.prototype.TF_frontEvent = function( mapId, eventId, logope ) {
		const sc = shortCircuit( logope );
		if( sc !== undefined ) return sc;	// ショートサーキット

		mapId = stringToMapId( mapId );
		if( mapId !== $gameMap.mapId() ) return false;

		eventId = stringToEventId( eventId );
		// const x = $gameMap.roundXWithDirection( $gamePlayer.x, $gamePlayer.direction() );
		// const y = $gameMap.roundYWithDirection( $gamePlayer.y, $gamePlayer.direction() );
		//const events = $gameMap.eventsXy( x, y );
		const x = $gameMap.roundHalfXWithDirection( $gamePlayer.x, $gamePlayer.direction() );//HalfMove.js のメソッド
		const y = $gameMap.roundHalfYWithDirection( $gamePlayer.y, $gamePlayer.direction() );//HalfMove.js のメソッド
		const events = $gameMap.eventsXyUnitNt( x, y );//HalfMove.js のメソッド
		return events.some( e => e.eventId() === eventId );
	};

	/**
	 * プレイヤーの座標位置と向きをチェックして合致しているか。
	 * 半歩移動を使っている場合は0.5を考慮する必要がある
	 * @param {String} mapId マップID | マップ名 | self | this
	 * @param {String} x 対象x座標(タイル数)
	 * @param {String} y 対象y座標(タイル数)
	 * @param {String} d プレイヤーの向き(テンキー対応 | 方向文字列)
	 * @param {String} logope 前の結果との論理演算子( logical operator )による接続( & | | | and | or )
	 * @returns {Boolean} 指定座標と向きか
	 */
	Game_Interpreter.prototype.TF_checkLocation = function( mapId, x, y, d, logope ) {
		const sc = shortCircuit( logope );
		if( sc !== undefined ) return sc;	// ショートサーキット

		mapId = stringToMapId( mapId );
		if( mapId !== $gameMap.mapId() ) return false;

		x = parseFloatStrict( x );
		y = parseFloatStrict( y );
		d = stringToDirection( d );
		if( d === undefined ) {
			return ( x === $gamePlayer.x && y === $gamePlayer.y );
		} else {
			return ( x === $gamePlayer.x && y === $gamePlayer.y && d === $gamePlayer.direction() );
		}
	};

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
		if( isNaN( i ) ) throw new Error( `I can't find the variable '${name}'` );
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
		if( isNaN( i ) ) throw new Error( `I can't find the switche '${name}'` );
		return i;
	}

	Game_Switches.prototype.MultipleAnd = function( ...args ) {

		return args.reduce( ( pre, curr ) => pre && $gameSwitches.valueByName( curr ), true );
	}

	/*--- SelfSwitche ---*/
	/**
	 * [セルフスイッチ] を設定します
	 * @param {String} eventId 対象イベント
	 * @param {String} type A・B・C・D いずれかの文字
	 * @param {String} isOn ON/OFF状態(指定なしの場合get動作してスイッチID1に値を書き込む)
	 */
	function setSelfSwitch( eventId, type, isOn ) {
		eventId = stringToEventId( eventId );
		type = type ? type.toUpperCase() : 'A';
		if( isOn === undefined ) {
			$gameSwitches.setValue( 1, $gameSelfSwitches.value( [ $gameMap.mapId(), id, type ] ) );
		} else {
			$gameSelfSwitches.setValue( [ $gameMap.mapId(), eventId, type ], parseBooleanStrict( isOn ) );
		}
	};

} )();
