//========================================
// TF_Condition.js
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
 * @plugindesc 条件判定関連のスクリプト
 * @author とんび@鳶嶋工房
 *
 * @param temporaryVariable
 * @desc 各種値を返す変数のID(規定値:1)
 * @type number
 * @min 1
 * @default 1
 * 
 * @param temporarySwitch
 * @desc 各種値を返すスイッチのID(規定値:1)
 * @type number
 * @min 1
 * @default 1
 * 
 * @help
 * 変数・スイッチ・セルフスイッチをIDだけでなく[名前]で設定できる。
 * そのため、制作途中でIDを変えても[名前]が同じなら大丈夫。
 * プレイヤー位置・前方のイベントなどの判定ができる。
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
 * 
 *------------------------------
 * TF_VAR [変数ID]
 * 　変数の値を、指定ID(規定値:1)の変数に設定。
 *
 * 例: TF_VAR 石を叩いた回数
 *------------------------------
 * [スクリプト] $gameVariables.valueByName( [変数ID] )
 *
 *------------------------------
 * TF_COMPARE [値] [比較演算子] [値] [比較演算子] [値]	(TODO:実装予定)
 * 　数値の比較
 * 　[値] V[n]形式の変数、数値、あるいは変数名
 * 　[比較演算子] 〜≦＜≠＝
 * 例: TF_COMPARE 10 ~ tmp ~ 15
 *------------------------------
 * TF_SW [スイッチID] [スイッチ状態]
 * 　スイッチを設定
 * 　[スイッチID] スイッチを ID、名前、変数V[n] のいずれかで指定
 * 　[スイッチ状態] true/false または ON/OFF で設定
 *
 * 例: TF_SW 賢者に会った ON
 *------------------------------
 * [スクリプト] $gameSwitches.setValueByName( [スイッチID], [スイッチ状態(真偽値)] )
 * 
 *------------------------------
 * TF_SW [スイッチID]
 * 　スイッチの値を、指定ID(規定値:1)のスイッチに設定。
 *
 * 例: TF_SW クイーンビーを倒した
 *------------------------------
 * [スクリプト] $gameSwitches.valueByName( [スイッチID] )
 * 
 *------------------------------
 * TF_SW_AND [スイッチID]...
 * 　複数のスイッチの値の論理積(AND)の結果を、指定ID(規定値:1)のスイッチに設定。
 * 
 * 例: TF_SW_AND 森の妖精 岩場の妖精 湖の妖精 丘の妖精
 *------------------------------
 * [スクリプト]  $gameSwitches.multipleAnd( [スイッチID]... )
 * 
 *------------------------------
 * TF_SELF_SW [マップID] [イベントID] [スイッチタイプ] [スイッチ状態]
 * 　同マップ内のイベントのセルフスイッチを設定。
 * 　[イベントID] 0:このイベント、-1:プレイヤー、1〜:イベントID(規定値:0)
 * 　　this(またはself):このイベント、player:プレイヤー
 * 　　イベントの[名前]で指定(上記の数値や this などと同じ名前、およびスペースの入った名前は指定できません)
 * 　[スイッチタイプ] A, B, C, D のいずれか
 * 　[マップID]  マップID | マップ名 | here | this
 * 
 * 例: TF_SELF_SW 1F:西スイッチ A true
 *------------------------------
 * TF_SELF_SW [マップID] [イベントID] [スイッチタイプ]
 * 　イベントのセルフスイッチの値を、指定ID(規定値:1)のスイッチに設定。
 * 
 * 例: TF_SELF_SW 石像 A
 *------------------------------
 * TF_FRONT_EVENT [マップID] [イベントID] [論理演算子]
 * 　プレイヤー前方に指定のイベントがあるかをチェックして、結果を指定ID(規定値:1)のスイッチに設定。
 * 　[論理演算子] 指定ID(規定値:1)のスイッチ と比較する 論理演算子( logical operator )による接続( & | | | and | or )
 *------------------------------
 * [スクリプト] this.TF_frontEvent( [マップID], [イベントID], [論理演算子] )
 * 　結果は返り値として返る。
 * 
 *------------------------------
 * TF_HERE_EVENT [マップID] [イベントID] [向き] [論理演算子]
 * 　プレイヤー位置の指定のイベントとプレイヤーの向きをチェックして、結果を指定ID(規定値:1)のスイッチに設定。
 * 　[向き] プレイヤーの向き(テンキー対応 | 方向文字列)
 * 　　上: 8, up, u, north, n, ↑
 * 　　左: 4, left, l, west, w, ←
 * 　　右: 6, right, r, east, e, →
 * 　　下: 2, down, d, south, s, ↓
 * 　　※[向き]は大文字小文字の区別をしません。
 *------------------------------
 * [スクリプト] this.TF_hereEvent( [マップID], [イベントID],[向き], [論理演算子] )
 * 　結果は返り値として返る。
 *
 *------------------------------
 * TF_CHECK_LOCATION [マップID] [x] [y] [向き] [論理演算子]
 * 　プレイヤーの座標位置と向きをチェックして合致して結果を、指定ID(規定値:1)のスイッチに設定。
 * 　(半歩移動を使っている場合は0.5単位で考慮)
 * 　[x] 対象x座標(タイル数)
 * 　[y] 対象y座標(タイル数)
 *------------------------------
 * [スクリプト] this.TF_checkLocation( [マップID], [x], [y], [向き], [論理演算子] )
 * 
 *------------------------------
 * TF_STAY_PAGE_IF [実行条件(真偽値)]
 * 　ページの[出現条件]をさらに追加する。
 * 　[実行条件(真偽値)] true:そのまま次の行を実行、false:次のページの実行(規定値:指定ID(規定値:1)のスイッチ)
 *------------------------------
 */

( function() {
	'use strict';
	const OPE_AND = 'and';
	const OPE_OR = 'or';
	const OPE_AND_MARK = '&';
	const OPE_OR_MARK = '|';

	/*---- パラメータパース関数 ----*/
	const PARAM_TRUE = 'true';
	const PARAM_ON = 'on';
	const TYPE_BOOLEAN = 'boolean';
	const TYPE_NUMBER = 'number';
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
			return $gameVariables.valueByName( id );
		} else {
			return $gameVariables.value( id );
		}
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
	 * ショートサーキット判定。
	 * @param {String} logope
     * @returns {Boolean} ショートサーキット成立した場合に、その値S[ 1 ]を返す
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
		if( i === -1 ) throw Error( `指定したイベント[${value}]がありません。` );
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
		if( isNaN( result ) ) throw Error( `指定したマップ[${value}]がありません。` );
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
		value = treatValue( value );
		const result = parseInt( value, 10 );
		if( !isNaN( result ) ) return result;

		value = value.toLowerCase();
		const index = DIRECTION_MAP.findIndex( e => e.in.includes( value ) );
		if( index === -1 ) return;
		return DIRECTION_MAP[ index ].out;
	}



	// HalfMove.js の確認
	const hasHalfMove = PluginManager._scripts.contains( 'HalfMove' );

    /**
     * パラメータを受け取る
     */
	const pluginParams = PluginManager.parameters( 'TF_Condition' );;
	const TF_tmpVar = parseFloatStrict( pluginParams.temporaryVariable );
	const TF_tmpSw = parseFloatStrict( pluginParams.temporarySwitch );


	/*---- Game_Interpreter ----*/
	const TF_VAR = 'TF_VAR';
	const TF_SW = 'TF_SW';
	const TF_SELF_SW = 'TF_SELF_SW';
	const TF_SW_AND = 'TF_SW_AND';
	const TF_CHECK_LOCATION = 'TF_CHECK_LOCATION';
	const TF_FRONT_EVENT = 'TF_FRONT_EVENT';
	const TF_HERE_EVENT = 'TF_HERE_EVENT';
	const TF_STAY_PAGE_IF = 'TF_STAY_PAGE_IF';

	/**
	 * プラグインコマンドの実行
	 */
	const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function( command, args ) {
		_Game_Interpreter_pluginCommand.apply( this, arguments );

		const commandStr = command.toUpperCase();
		switch( commandStr ) {
			case TF_VAR:
				if( args[ 1 ] === undefined ) {
					$gameVariables.setValue( TF_tmpVar, $gameVariables.valueByName( args[ 0 ] ) );
				} else {
					$gameVariables.setValueByName( args[ 0 ], args[ 1 ] );
				}
				break;
			case TF_SW:
				if( args[ 1 ] === undefined ) {
					$gameSwitches.setValue( TF_tmpSw, $gameSwitches.valueByName( args[ 0 ] ) );
				} else {
					$gameSwitches.setValueByName( args[ 0 ], args[ 1 ] );
				}
				break;
			case TF_SELF_SW: setSelfSwitch( ...args ); break;
			case TF_SW_AND: $gameSwitches.setValue( TF_tmpSw, $gameSwitches.multipleAnd( ...args ) ); break;
			case TF_FRONT_EVENT: $gameSwitches.setValue( TF_tmpSw, this.TF_frontEvent( ...args ) ); break;
			case TF_HERE_EVENT: $gameSwitches.setValue( TF_tmpSw, this.TF_hereEvent( ...args ) ); break;
			case TF_CHECK_LOCATION: $gameSwitches.setValue( TF_tmpSw, this.TF_checkLocation( ...args ) ); break;
			case TF_STAY_PAGE_IF: stayPageIf( this, args[ 0 ] ); break;
		}
	};

	/**
	 * TF_FRONT_EVENT の実行。
	 * プレイヤー前方に指定イベントの判定があるか。
	 * @param {String} mapId マップID | マップ名 | here | this
	 * @param {String} eventId 対象イベント
	 * @param {String} logope 前の結果との論理演算子( logical operator )による接続( & | | | and | or )
	 * @returns {Boolean} 指定イベントがあるか
	 */
	Game_Interpreter.prototype.TF_frontEvent = function( mapId, eventId, logope ) {
		return collisionCheck( this, mapId, eventId, logope, $gamePlayer.direction() );
	};

	/**
	 * TF_HERE_EVENT の実行。
	 * プレイヤー位置に指定イベントの判定があるか。
	 * @param {String} mapId マップID | マップ名 | here | this
	 * @param {String} eventId 対象イベント
	 * @param {String} d プレイヤーの向き(テンキー対応 | 方向文字列)
	 * @param {String} logope 前の結果との論理演算子( logical operator )による接続( & | | | and | or )
	 * @returns {Boolean} 指定イベントがあるか
	 */
	Game_Interpreter.prototype.TF_hereEvent = function( mapId, eventId, d, logope ) {
		d = stringToDirection( d );
		const resultD = d ? ( d === $gamePlayer.direction() ) : true;
		return collisionCheck( this, mapId, eventId, logope ) && resultD;
	};

	function collisionCheck( interpreter, mapId, eventId, logope, d ) {
		const sc = shortCircuit( logope );
		if( sc !== undefined ) return sc;	// ショートサーキット

		mapId = stringToMapId( mapId );
		if( mapId !== $gameMap.mapId() ) return false;

		let events;
		if( hasHalfMove ) {//HalfMove.js を使っている場合
			const x = d ? $gameMap.roundHalfXWithDirection( $gamePlayer.x, d ) : $gamePlayer.x;
			const y = d ? $gameMap.roundHalfYWithDirection( $gamePlayer.y, d ) : $gamePlayer.y;
			events = $gameMap.eventsXyUnitNt( x, y );
		} else {
			const x = d ? $gameMap.roundXWithDirection( $gamePlayer.x, d ) : $gamePlayer.x;
			const y = d ? $gameMap.roundYWithDirection( $gamePlayer.y, d ) : $gamePlayer.y;
			events = $gameMap.eventsXy( x, y );
		}
		const targetEvent = getEventById( interpreter, stringToEventId( eventId ) );
		return events.some( e => e === targetEvent );
	}

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
		if( typeof name === TYPE_NUMBER ) return name;
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
		if( typeof name === TYPE_NUMBER ) return name;
		name = treatValue( name );
		let i = $dataSystem.switches.findIndex( i => i === name );
		if( 0 <= i ) return i;
		i = parseInt( name, 10 );
		if( isNaN( i ) ) throw new Error( `I can't find the switch '${name}'` );
		return i;
	}

	Game_Switches.prototype.multipleAnd = function( ...args ) {
		return args.reduce( ( pre, curr ) => pre && $gameSwitches.valueByName( curr ), true );
	};

	/*--- SelfSwitche ---*/
	/**
	 * [セルフスイッチ] を設定します
	 * @param {String} mapId 対象マップ
	 * @param {String} eventId 対象イベント
	 * @param {String} type A・B・C・D いずれかの文字
	 * @param {String} isOn ON/OFF状態(指定なしの場合get動作してスイッチID1に値を書き込む)
	 */
	function setSelfSwitch( mapId, eventId, type, isOn ) {
		mapId = stringToMapId( mapId );
		eventId = stringToEventId( eventId );
		type = type ? type.toUpperCase() : 'A';
		if( isOn === undefined ) {
			$gameSwitches.setValue( TF_tmpSw, $gameSelfSwitches.value( [ mapId, eventId, type ] ) );
		} else {
			$gameSelfSwitches.setValue( [ mapId, eventId, type ], parseBooleanStrict( isOn ) );
		}
	}
} )();
