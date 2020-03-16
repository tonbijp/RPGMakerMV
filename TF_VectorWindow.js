//========================================
// TF_VectorWindow.js
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
 * @plugindesc ウィンドウの表示をベクトル描画
 * @author とんび@鳶嶋工房
 *
 * @param preset
 * @desc ウィンドウの設定(1が規定)
 * @type struct<WindowParamJa>[]
 * @default ["{\"margine\":\"8\",\"borderWidth\":\"6\",\"borderColor\":\"white\",\"bordeRadius\":\"15\",\"padding\":\"10\",\"bgColor\":\"#0006\"}"]
 *
 * @param lineHeight
 * @desc 標準文字サイズを基準とした行の高さ(%)
 * @type number
 * @min 100
 * @default 140
 * 
 * @param systemFontSize
 * @desc フォントサイズ
 * @type number
 * @min 8
 * @default 40
 *
 * @param messageFontSize
 * @desc フォントサイズ
 * @type number
 * @min 8
 * @default 40
 * 
 * @param messageLines
 * @desc メッセージに表示する行数
 * @type number
 * @min 1
 * @default 3
 * 
 * @help
 * ウィンドウをPNG画像を使わずに描画する。
 * 特にメリットはないけど、将来的に便利なことになるはず。
 */
/*~struct~WindowParamJa:
 *
 * @param margine
 * @desc 枠外の間隔
 * @type number
 * @min 0
 * @default 8
 *
 * @param borderWidth
 * @desc 枠の幅
 * @type number
 * @min 0
 * @default 6
 * 
 * @param borderColor
 * @desc 枠の色(CSS形式)
 * @type color
 * @default #FFF
 *
 * @param bordeRadius
 * @desc 枠の角丸の半径
 * @type number
 * @min 0
 * @default 10
 * 
 * @param padding
 * @desc 枠と文字の間隔
 * @type number
 * @min 0
 * @default 18
 * 
 * @param bgColor
 * @desc 背景色(CSS形式)
 * @type string
 * @default #0008
 */

( function() {
	'use strict';
	const TF_SET_WINDOW = 'TF_SET_WINDOW';
	const FRAME_ROUND_RECT = 'round rect';
	const FRAME_BOMB = 'bomb';
	const FRAME_ = 'bomb';
	const PARAM_TRUE = 'true';

    /**
     * パラメータを受け取る
     */
	const pluginParams = PluginManager.parameters( 'TF_VectorWindow' );

	// プリセット設定
	const presetList = JsonEx.parse( pluginParams.preset );
	pluginParams.preset = presetList.map( value => {
		const params = JsonEx.parse( value );
		params.margine = parseFloatStrict( params.margine );
		params.borderWidth = parseFloatStrict( params.borderWidth );
		params.borderColor = params.borderColor;
		params.bordeRadius = parseFloatStrict( params.bordeRadius );
		params.padding = parseFloatStrict( params.padding );
		params.bgColor = params.bgColor;
		return params;
	} );

	// 全体設定
	const SYSTEM_FONT_SIZE = parseFloatStrict( pluginParams.systemFontSize );
	const MESSAGE_FONT_SIZE = parseFloatStrict( pluginParams.messageFontSize );
	const LINE_HEIGHT = parseFloatStrict( pluginParams.lineHeight ) / 100;
	const MESSAGE_LINES = parseIntStrict( pluginParams.messageLines );
	let TF_windowType = 0;


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

	/*---- Game_Interpreter ----*/
	/**
	 * プラグインコマンドの実行
	 */
	const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function( command, args ) {
		_Game_Interpreter_pluginCommand.apply( this, arguments );

		const commandStr = command.toUpperCase();
		if( commandStr === TF_SET_WINDOW ) {
			if( SceneManager._scene._messageWindow ) {
				TF_windowType = parseIntStrict( args[ 0 ] );
				SceneManager._scene._messageWindow._refreshFrame();
			}
		}
	};


	/*--- Window ---*/
	const _Window_initialize = Window.prototype.initialize;
	Window.prototype.initialize = function() {
		_Window_initialize.call( this );
		this._margin = pluginParams.preset[ TF_windowType ].margine;
	};
	// _windowBackSprite は alpha を保持するだけで描画はしない
	Window.prototype._refreshBack = function() { };
	Window.prototype._refreshFrame = function() {
		const m = this._margin;

		const bitmap = new Bitmap( this._width, this._height );

		this._windowFrameSprite.bitmap = bitmap;
		this._windowFrameSprite.setFrame( 0, 0, this._width, this._height + 12 );

		const ctx = bitmap.context;
		ctx.fillStyle = pluginParams.preset[ TF_windowType ].bgColor;
		ctx.lineWidth = pluginParams.preset[ TF_windowType ].borderWidth;
		ctx.strokeStyle = pluginParams.preset[ TF_windowType ].borderColor;

		function roundRect( ctx, x, y, w, h, r ) {
			ctx.beginPath()
			ctx.moveTo( x + r, y );
			ctx.arcTo( x + w, y, x + w, y + r, r );// ─╮
			ctx.arcTo( x + w, y + h, x + w - r, y + h, r );//│ ╯
			ctx.arcTo( x, y + h, x, y + h - r, r );//╰─
			ctx.arcTo( x, y, x + r, y, r );// │╭
			ctx.closePath();
			ctx.shadowBlur = 8;
			ctx.shadowColor = 'black';
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 6;
			ctx.fill();
			if( pluginParams.preset[ TF_windowType ].borderWidth ) {
				ctx.shadowBlur = 3;
				ctx.shadowOffsetY = 0;
				ctx.stroke();
			}
		}
		roundRect( ctx, m, m, this._width - m * 2, this._height - m * 2, pluginParams.preset[ TF_windowType ].bordeRadius );
	};

	/*--- Window_Base ---*/
	Window_Base.prototype.standardFontSize = () => SYSTEM_FONT_SIZE;
	Window_Base.prototype.standardPadding = () => pluginParams.preset[ TF_windowType ].padding + pluginParams.preset[ TF_windowType ].margine;
	Window_Base.prototype.textPadding = () => ( SYSTEM_FONT_SIZE * LINE_HEIGHT - SYSTEM_FONT_SIZE ) / 2;
	Window_Base.prototype.lineHeight = () => SYSTEM_FONT_SIZE * LINE_HEIGHT;

	const _Window_Base_calcTextHeight = Window_Base.prototype.calcTextHeight;
	Window_Base.prototype.calcTextHeight = function( textState, all ) {
		const baseLines = _Window_Base_calcTextHeight.apply( this, arguments );
		const length = textState.text.slice( textState.index ).split( '\n' ).length;
		const maxLines = all ? length : 1;
		return baseLines + maxLines * ( this.textPadding() * 2 - 8 );// 8はコアスクリプトが固定で入れている数値
	}


	/*--- Window_Message ---*/
	Window_Message.prototype.standardFontSize = () => MESSAGE_FONT_SIZE;
	Window_Message.prototype.numVisibleRows = () => MESSAGE_LINES;
	Window_Message.prototype.textPadding = () => ( MESSAGE_FONT_SIZE * LINE_HEIGHT - MESSAGE_FONT_SIZE ) / 2;
	Window_Message.prototype.lineHeight = () => MESSAGE_FONT_SIZE * LINE_HEIGHT;
	Window_Message.prototype.updateClose = function() {
		const preClosing = this._closing;
		Window_Base.prototype.updateClose.call( this );
		if( preClosing !== this._closing && TF_windowType ) {
			TF_windowType = 0;
			this._refreshFrame();
		}
	};
} )();
