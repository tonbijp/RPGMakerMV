//========================================
// TF_VectorWindow.js
// Version :0.3.1.0
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
 * @default ["{\"shape\":\"roundrect\",\"margin\":\"8\",\"borderWidth\":\"6\",\"borderColor\":\"#fff\",\"decorSize\":\"20\",\"padding\":\"14\",\"bgColor\":\"#0006\"}","{\"shape\":\"roundrect\",\"margin\":\"6\",\"borderWidth\":\"2\",\"borderColor\":\"#666\",\"decorSize\":\"100\",\"padding\":\"16\",\"bgColor\":\"#000a\"}","{\"shape\":\"spike\",\"margin\":\"60\",\"borderWidth\":\"6\",\"borderColor\":\"#fff\",\"decorSize\":\"80\",\"padding\":\"14\",\"bgColor\":\"#0006\"}"]
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
 * @param shape
 * @desc ウィンドウの形
 * @type select
 * @option 角丸(decorSize:0 で長方形)
 * @value roundrect
 * @option トゲトゲ
 * @value spike
 * @option 8角形
 * @value octagon
 * @option なし
 * @value none
 * @default roundrect
 * 
 * @param margin
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
 * @param decorSize
 * @desc 装飾の大きさ(角丸・角・トゲ)
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
	const FRAME_ROUNDRECT = 'roundrect';
	const FRAME_SPIKE = 'spike';
	const PARAM_TRUE = 'true';

    /**
     * パラメータを受け取る
     */
	const pluginParams = PluginManager.parameters( 'TF_VectorWindow' );

	// プリセット設定
	const presetList = JsonEx.parse( pluginParams.preset );
	pluginParams.preset = presetList.map( value => {
		const params = JsonEx.parse( value );
		params.margin = parseFloatStrict( params.margin );
		params.borderWidth = parseFloatStrict( params.borderWidth );
		params.borderColor = params.borderColor;
		params.decorSize = parseFloatStrict( params.decorSize );
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
			const messageWindow = SceneManager._scene._messageWindow;
			if( messageWindow ) {
				setWindowType( messageWindow, parseIntStrict( args[ 0 ] ) );
			}
		}
	};


	/*--- Window ---*/
	const _Window_initialize = Window.prototype.initialize;
	Window.prototype.initialize = function() {
		_Window_initialize.call( this );
		this._margin = pluginParams.preset[ TF_windowType ].margin;
	};

	// _refreshFrameは機能しない。
	const _Window__refreshFrame = Window.prototype._refreshFrame;
	Window.prototype._refreshFrame = function() {
		// SceneCustomMenu.js のスキンの設定があれば、通常の描画に渡す。
		if( this._data && this._data.WindowSkin ) {
			_Window__refreshFrame.call( this );
		}
	};

	// _colorTone を反映させるため、_refreshBack の方で描画。
	const _Window__refreshBack = Window.prototype._refreshBack;
	Window.prototype._refreshBack = function() {
		// SceneCustomMenu.js のスキンの設定があれば、通常の描画に渡す。
		if( this._data && this._data.WindowSkin ) {
			_Window__refreshBack.call( this );
		}

		const shape = pluginParams.preset[ TF_windowType ].shape;
		if( shape === 'none' ) return;

		const m = this.margin;
		const r = pluginParams.preset[ TF_windowType ].decorSize;

		const bitmap = new Bitmap( this._width, this._height );

		this._windowFrameSprite.bitmap = bitmap;
		this._windowFrameSprite.setFrame( 0, 0, this._width, this._height + 12 );

		const ctx = bitmap.context;
		switch( shape ) {
			case 'roundrect': drawRoundrect( ctx, m, this._width, this._height, r ); break;
			case 'octagon': drawOctagon( ctx, m, this._width, this._height, r ); break;
			case 'spike': drawSpike( ctx, m, this._width, this._height, r ); break;
		}
		dropShadow( ctx );

		ctx.fillStyle = pluginParams.preset[ TF_windowType ].bgColor;
		ctx.fill();
		const tone = this._colorTone; // [ r, g, b ];
		bitmap.adjustTone( tone[ 0 ], tone[ 1 ], tone[ 2 ] );

		drawBorder( ctx );

		function dropShadow( ctx ) {
			ctx.shadowBlur = 8;
			ctx.shadowColor = 'black';
			ctx.shadowOffsetX = 0;
			ctx.shadowOffsetY = 6;
		}

		function drawBorder( ctx ) {
			if( !pluginParams.preset[ TF_windowType ].borderWidth ) return;

			ctx.lineWidth = pluginParams.preset[ TF_windowType ].borderWidth;
			ctx.strokeStyle = pluginParams.preset[ TF_windowType ].borderColor;
			ctx.shadowBlur = 3;
			ctx.shadowOffsetY = 0;
			ctx.stroke();
		}

		/**
		 * 角丸の矩形を描く
		 * @param {*} ctx CanvasRenderingContext2D
		 * @param {*} m 枠外のマージン
		 * @param {*} w ウィンドウ描画領域の幅
		 * @param {*} h ウィンドウ描画領域の高さ
		 * @param {*} r 角丸の半径
		 */
		function drawRoundrect( ctx, m, w, h, r ) {
			const iRect = { l: m, r: w - m, u: m, d: h - m };// 内側座標
			const cRect = { l: m + r, r: w - ( m + r ), u: m + r, d: h - ( m + r ) };// 角を除く内側座標

			ctx.beginPath();
			ctx.moveTo( cRect.l, iRect.u );
			ctx.arcTo( iRect.r, iRect.u, iRect.r, cRect.u, r );// ─╮
			ctx.arcTo( iRect.r, iRect.d, cRect.r, iRect.d, r );//│ ╯
			ctx.arcTo( iRect.l, iRect.d, iRect.l, cRect.d, r );//╰─
			ctx.arcTo( iRect.l, iRect.u, cRect.l, iRect.u, r );// │╭
			ctx.closePath();
		}

		/**
		 * 8角形を描く
		 * @param {*} ctx CanvasRenderingContext2D
		 * @param {*} m 枠外のマージン
		 * @param {*} w ウィンドウ描画領域の幅
		 * @param {*} h ウィンドウ描画領域の高さ
		 * @param {*} r √r*r = 角の斜め線の長さ
		 */
		function drawOctagon( ctx, m, w, h, r ) {
			const iRect = { l: m, r: w - m, u: m, d: h - m };// 内側座標
			const cRect = { l: m + r, r: w - ( m + r ), u: m + r, d: h - ( m + r ) };// 角を除く内側座標

			ctx.beginPath();
			ctx.moveTo( cRect.l, iRect.u );
			ctx.lineTo( cRect.r, iRect.u );//─
			ctx.lineTo( iRect.r, cRect.u );// ╲
			ctx.lineTo( iRect.r, cRect.d );// │ 
			ctx.lineTo( cRect.r, iRect.d );// ╱
			ctx.lineTo( cRect.l, iRect.d );// ─
			ctx.lineTo( iRect.l, cRect.d );// ╲
			ctx.lineTo( iRect.l, cRect.u );// │
			ctx.closePath();
		}

		/**
		 * トゲ型装飾枠を描く
		 * @param {*} ctx CanvasRenderingContext2D
		 * @param {*} m トゲの長さ
		 * @param {*} w ウィンドウ描画領域の幅
		 * @param {*} h ウィンドウ描画領域の高さ
		 * @param {*} r トゲの(おおよその)横幅
		 */
		function drawSpike( ctx, m, w, h, r ) {

			const bw = pluginParams.preset[ TF_windowType ].borderWidth;

			const iRect = { l: m, r: w - m, u: m, d: h - m };// 内側座標
			const oRect = { l: bw, r: w - bw, u: bw, d: h - bw };// 内側座標

			const rndDiff = () => ( Math.random() - 0.5 ) * r * 0.4; // 中央値からの差、辺に使う
			const rndPosi = () => Math.random() * m * 0.6; // 正の値、角に使う

			ctx.beginPath();
			ctx.moveTo( oRect.l + rndPosi(), oRect.u + rndPosi() );//┌
			const hNum = Math.floor( w / ( r * 1.2 ) );
			const hUnit = w / hNum;

			for( let i = 1; i < hNum - 2; i++ ) {
				ctx.lineTo( iRect.l + i * hUnit + rndDiff(), iRect.u );
				ctx.lineTo( iRect.l + ( i + 0.5 ) * hUnit + rndDiff(), oRect.u );// 人
			}
			ctx.lineTo( iRect.r - hUnit / 2 + rndDiff(), iRect.u );

			ctx.lineTo( oRect.r - rndPosi(), oRect.u + rndPosi() );//┐

			ctx.lineTo( iRect.r, ( h + rndDiff() ) / 2 - r / 3 );
			ctx.lineTo( iRect.r + m / 2, ( h + rndDiff() ) / 2 );// >
			ctx.lineTo( iRect.r, ( h + rndDiff() ) / 2 + r / 3 );

			ctx.lineTo( oRect.r - rndPosi(), oRect.d - rndPosi() );// ┘

			for( let i = 1; i < hNum - 2; i++ ) {
				ctx.lineTo( iRect.r - i * hUnit + rndDiff(), iRect.d );
				ctx.lineTo( iRect.r - ( i + 0.5 ) * hUnit + rndDiff(), oRect.d );// Ｙ
			}
			ctx.lineTo( iRect.l + hUnit / 2 + rndDiff(), iRect.d );

			ctx.lineTo( oRect.l + rndPosi(), oRect.d - rndPosi() );//└

			// <
			ctx.lineTo( iRect.l, ( h + rndDiff() ) / 2 + r / 3 );
			ctx.lineTo( iRect.l - m / 2, ( h + rndDiff() ) / 2 );
			ctx.lineTo( iRect.l, ( h + rndDiff() ) / 2 - r / 3 );

			ctx.closePath();
		}
	};

	/*--- Window_Base ---*/
	Window_Base.prototype.standardFontSize = () => SYSTEM_FONT_SIZE;
	Window_Base.prototype.standardPadding = () => pluginParams.preset[ TF_windowType ].padding + pluginParams.preset[ TF_windowType ].margin;
	Window_Base.prototype.textPadding = () => ( SYSTEM_FONT_SIZE * LINE_HEIGHT - SYSTEM_FONT_SIZE ) / 2;
	Window_Base.prototype.lineHeight = () => Math.ceil( SYSTEM_FONT_SIZE * LINE_HEIGHT );

	const _Window_Base_calcTextHeight = Window_Base.prototype.calcTextHeight;
	Window_Base.prototype.calcTextHeight = function( textState, all ) {
		const baseLines = _Window_Base_calcTextHeight.apply( this, arguments );
		const length = textState.text.slice( textState.index ).split( '\n' ).length;
		const maxLines = all ? length : 1;
		return baseLines + maxLines * ( this.textPadding() * 2 - 8 );// 8はコアスクリプトが固定で入れている数値
	};


	/*--- Window_Message ---*/
	Window_Message.prototype.standardFontSize = () => MESSAGE_FONT_SIZE;
	Window_Message.prototype.numVisibleRows = () => MESSAGE_LINES;
	Window_Message.prototype.textPadding = () => ( MESSAGE_FONT_SIZE * LINE_HEIGHT - MESSAGE_FONT_SIZE ) / 2;
	Window_Message.prototype.lineHeight = () => MESSAGE_FONT_SIZE * LINE_HEIGHT;
	Window_Message.prototype.updateClose = function() {
		const preClosing = this._closing;
		Window_Base.prototype.updateClose.call( this );
		if( preClosing !== this._closing && TF_windowType ) {
			setWindowType( this, 0 );
		}
	};

	function setWindowType( messageWindow, windowType ) {
		TF_windowType = windowType;
		const margin = pluginParams.preset[ windowType ].margin;

		messageWindow._margin = margin;
		// RPGツクールMVの padding は CSS と違い「box の一番外から contents までの距離」なので変換
		messageWindow._padding = pluginParams.preset[ windowType ].padding + margin;
		messageWindow._height = messageWindow.windowHeight();
		messageWindow._refreshAllParts();
	}
} )();
