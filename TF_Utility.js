//========================================
// TF_Utility.js
// Version :0.5.0.0
// For : RPGツクールMV (RPG Maker MV)
// -----------------------------------------------
// Copyright : Tobishima-Factory 2019-2020
// Website : http://tonbi.jp
//
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//========================================
/*:ja
* @plugindesc [スクリプト]から使いやすいコマンド集
* @author とんび@鳶嶋工房
* 
* @help
* イベントコマンドの[スクリプト]から使いやすいようにラッピング。
* TkoolMV_PluginCommandBook.js 必須。
* 
* TF_setCharPattern [イベントID] [画像ファイル名] [キャラ番号] [歩行パターン] [向き]
* 　キャラパターンを設定(一度のコマンドで設定でき、歩行パターンも指定可能)。
*
* TF_startAnime [イベントID]
* 　アニメモードに変更(移動アニメ停止・[すり抜け]ON)。
*
* TF_anime [イベントID] [x移動] [y移動] [ウエイト] [キャラ番号] [パターン]
* 　アニメの指定。
*
* TF_endAnime [イベントID]
* 　通常モードに戻る。
*
* TF_verticalAnime [イベントID] [画像ファイル名] [キャラ番号] [歩行パターン] [ウエイト]
* 　下→左→右→上 の順に向きを変えてアニメーションする。
*
*【引数の説明】
* [イベントID] 0:このイベント、-1:プレイヤー、-2〜-4:隊列メンバー、1〜:イベントID
* [画像ファイル名] .pngを除いた img/character/ フォルダのファイル名
* [キャラ番号] 画像の上段左から 0,１, 2, 3 、下段目が 4, 5, 6, 7 となる番号
* [パターン番号] 3パターンアニメの左から 0, 1, 2
* [向き] 4方向のキャラの向き、テンキーに対応した 2, 4, 6, 8
* [パターン] [歩行パターン] と [向き] を一度に指定する番号。
* 歩行グラフィックの位置だと以下並び。
* 0, 1, 2		<= 下向き(テンキー2)
* 3, 4, 5		<= 左向き(テンキー4)
* 6, 7, 8		<= 右向き(テンキー6)
* 9, 10, 11 <= 上向き(テンキー8)
*/

( function() {
	'use strict';
	const PLUGIN_NAME = 'TF_Utility';
	const PARAM_TRUE = 'true';

	/**
	 * データベースにオリジナルのJSONを追加する
	 */
	// const $myJson;
	// DataManager._databaseFiles.push(
	// 	{ name: '$myJson', src: '$myJson.json' }
	// );

	/**
	 * @method parseIntStrict
	 * @param {String} value
	 * @return {Number} 数値に変換した結果
	 */
	function parseIntStrict( value ) {
		if( value === undefined || value === '' ) return 0;
		if( value[ 0 ] === 'V' || value[ 0 ] === 'v' ) {
			value = value.replace( /[Vv]\[([0-9]+)\]/, ( match, p1 ) => $gameVariables.value( parseInt( p1, 10 ) ) );
		}
		const result = parseInt( value, 10 );
		if( isNaN( result ) ) throw Error( '指定した値[' + value + ']が数値ではありません。' );
		return result;
	};

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


	/**
	 * マップ移動前の処理。
	 * 向きは省略可能で、規定値は現在の向き( 0 )が設定される。
	 * TF_moveBefore マップID x座標 y座標 向き
	 */
	Game_Interpreter.prototype.pluginCommandBook_TF_moveBefore = function( args ) {
		const mapId = parseIntStrict( args[ 0 ] );
		const x = parseIntStrict( args[ 1 ] );
		const y = parseIntStrict( args[ 2 ] );
		const d = parseIntStrict( args[ 3 ] );
		const commandList = [
			{
				indent: 0, code: SET_MOVEMENT_ROUTE, parameters: [ PLAYER_CHARACTER,
					{
						repeat: false, skippable: true, wait: true, list: [
							{ code: gc.ROUTE_THROUGH_ON },
							{ code: gc.ROUTE_MOVE_FORWARD },
							{ code: gc.ROUTE_END }
						]
					}
				]
			},
			{ indent: 0, code: CHANGE_PLAYER_FOLLOWERS, parameters: [ 1 ] },
			{ indent: 0, code: FADEOUT_SCREEN },
			{ indent: 0, code: PLAY_SE, parameters: [ { name: 'Move1', volume: 30, pitch: 100, pan: 0 } ] },
			{ indent: 0, code: TRANSFER_PLAYER, parameters: [ 0, mapId, x, y, d, 2 ] },
			{ indent: 0, code: COMMAND_END }
		];
		this.setupChild( commandList, this._eventId );
	};

	/**
	 * TF_moveAfter
	 */
	Game_Interpreter.prototype.pluginCommandBook_TF_moveAfter = function() {
		const targetEvent = this.character( PLAYER_CHARACTER );
		if( targetEvent.direction() === 2 ) {
			// 下向きの際は、-0.5座標を移動する
			targetEvent._realY = targetEvent._y -= 0.5;
		}

		const commandList = [
			{ indent: 0, code: CHANGE_PLAYER_FOLLOWERS, parameters: [ 0 ] },
			{ indent: 0, code: FADEIN_SCREEN },
			{
				indent: 0, code: SET_MOVEMENT_ROUTE, parameters: [ PLAYER_CHARACTER,
					{
						repeat: false, skippable: true, wait: true, list: [
							{ code: gc.ROUTE_THROUGH_ON },
							{ code: gc.ROUTE_DIR_FIX_OFF },
							{ code: gc.ROUTE_MOVE_FORWARD },
							{ code: gc.ROUTE_MOVE_FORWARD },
							{ code: gc.ROUTE_THROUGH_OFF },
							{ code: gc.ROUTE_END }
						]
					}
				]
			},
			{ indent: 0, code: COMMAND_END }
		];
		this.setupChild( commandList, this._eventId );
	};


	// Show Picture
	Game_Interpreter.prototype.pluginCommandBook_TF_pict = function( args ) {
		const x = args[ 0 ];
		const y = args[ 1 ];
		// 
		$gameScreen.showPicture( this._params[ 0 ], this._params[ 1 ], this._params[ 2 ],
			x, y, this._params[ 6 ], this._params[ 7 ], this._params[ 8 ], this._params[ 9 ] );
		return true;
	};


	/**
	 * 
	 */
	Game_Interpreter.prototype.pluginCommandBook_TF_self = function() {
		return this.eventId();
	};

	/**
	 * 変数を名前の文字列で指定して値を ID1 の変数に代入
	 * args[ 0 ] | String | 変数名
	 */
	Game_Interpreter.prototype.pluginCommandBook_TF_variable = function() {
		$gameVariables.setValue( 1, $gameVariables.getValueByName( args[ 0 ] ) );
	};
	/**
	 * スイッチを名前の文字列で指定して値を ID1 のスイッチに代入
	 * args[ 0 ] | String | 変数名
	 */
	Game_Interpreter.prototype.pluginCommandBook_TF_switch = function() {
		$gameSwitches.setValue( 1, $gameSwitches.getValueByName( args[ 0 ] ) );
	};


	/**
	 * [セルフスイッチ] を設定します
	 * @param {String} type A・B・C・D いずれかの文字
	 */
	Game_Interpreter.prototype.pluginCommandBook_TF_setSelfSw = function( args ) {
		const type = args[ 0 ];
		const isOn = args[ 1 ];
		$gameSelfSwitches.setValue( [ $gameMap.mapId(), this.eventId(), type ], isOn );
		return this;
	};
	Game_Interpreter.prototype.pluginCommandBook_TF_getSelfSw = function() {
		$gameSelfSwitches.setValue( [ $gameMap.mapId(), this.eventId(), "A" ], true );
		return this;
	};

	// 出現条件(アイテム)
	Game_Interpreter.prototype.pluginCommandBook_TF_conditionItem = function() {
		return $dataItems[ this.character( this.eventId() ).page().conditions.itemId ];
	};


	/*--- Game_Variables ---*/
	/**
	 * 変数を文字列で指定して返す
	 */
	Game_Variables.prototype.getValueByName = function( name ) {
		const i = $dataSystem.variables.findIndex( i => i === name );
		if( i === -1 ) throw new Error( `I can't find the variable '${name}'` );
		return this.value( i );
	};

	/*--- Game_Switches ---*/
	/**
	 * スイッチを文字列で指定して返す
	 */
	Game_Switches.prototype.getValueByName = function( name ) {
		const i = $dataSystem.switches.findIndex( value => value === name );
		if( i === -1 ) throw new Error( `I can't find the switch '${name}'` );
		return this.value( i );
	};

	/*--- Window_Options ---*/
	/**
	 * オプション: 音量の最小変更数を5に。
	 */
	Window_Options.prototype.volumeOffset = function() {
		return 5;
	};

	/*--- Window_Message ---*/
	/**
	 * ウィンドウ幅:1000px
	 */
	Window_Message.prototype.windowWidth = function() {
		return 1000;
	};
	/**
	 * フォントサイズ:40px
	 */
	Window_Message.prototype.standardFontSize = function() {
		return 40;
	};
	/**
	 * 行数:3行
	 */
	Window_Message.prototype.numVisibleRows = function() {
		return 3;
	};
	/**
	 * 行高さ:+8px
	 */
	Window_Message.prototype.calcTextHeight = function( textState, all ) {
		return Window_Base.prototype.calcTextHeight.apply( this, arguments ) + 8;
	}
	Window_Message.prototype.lineHeight = function() {
		return 56;
	};

	/**
	 * 顔画像に名前を追加。
	 */
	const _Window_Message_drawMessageFace = Window_Message.prototype.drawMessageFace;
	Window_Message.prototype.drawMessageFace = function() {
		_Window_Message_drawMessageFace.call( this );
		if( $gameMessage.faceName() === '' ) return;

		const getActorName = () => {
			const faceName = $gameMessage.faceName();
			// $dataActors[ 0 ] は null なので、1から検索
			const actorList = $dataActors.slice( 1 );
			const resultIndex = actorList.findIndex( e => e.faceName === faceName );
			if( resultIndex === -1 ) {
				return '';
			} else {
				return $dataActors[ resultIndex + 1 ].name;
			}
		};
		const tempFontSize = this.contents.fontSize;
		this.contents.fontSize = 24;
		this.drawText( getActorName(), 0, this.contentsHeight() - 40, 144, 'center' );
		this.contents.fontSize = tempFontSize;
	}

	/**
	 * 顔グラに用意する画面幅を大きめに設定。
	 */
	Window_Message.prototype.newLineX = function() {
		return $gameMessage.faceName() === '' ? 0 : ( 168 + 40 );
	};

} )();
