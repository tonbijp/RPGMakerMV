//========================================
// TF_VectorWindow.js
// Version :0.5.1.1
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
 * @desc ウィンドウ設定のプリセット(1が規定)
 * @type struct<WindowParamJa>[]
 * @default ["{\"shape\":\"roundrect\",\"margin\":\"6\",\"borderWidth\":\"6\",\"borderColor\":\"#0ee\",\"decorSize\":\"20\",\"padding\":\"14\",\"bgColor\":\"[\\\"#0008\\\"]\"}","{\"shape\":\"roundrect\",\"margin\":\"6\",\"borderWidth\":\"2\",\"borderColor\":\"#666\",\"decorSize\":\"100\",\"padding\":\"16\",\"bgColor\":\"[\\\"#000a\\\"]\"}","{\"shape\":\"spike\",\"margin\":\"60\",\"borderWidth\":\"6\",\"borderColor\":\"#fff\",\"decorSize\":\"80\",\"padding\":\"14\",\"bgColor\":\"[\\\"#0006\\\"]\"}"]
 * 
 * @param dropShadow
 * @desc ウィンドウの影を落とすか
 * @type boolean
 * @default true
 * 
 * @param lineHeight
 * @desc 標準文字サイズを基準とした行の高さ(%)
 * @type number
 * @min 100
 * @default 140
 * 
 * @param systemFontSize
 * @desc システムフォントサイズ
 * @type number
 * @min 8
 * @default 24
 *
 * @param messageFontSize
 * @desc メッセージフォントサイズ
 * @type number
 * @min 8
 * @default 30
 * 
 * @param messageLines
 * @desc メッセージに表示する行数
 * @type number
 * @min 1
 * @default 3
 * 
 * @help
 * ウィンドウをPNG画像を使わずに描画する。
 * グラデーション、ドロップシャドウ、フキダシの指定が可能。
 * 
 * TF_SET_WINDOW [プリセット番号]
 * 
 * [プリセット番号] : preset プラグインパラメータで設定した番号
 * 
 */
/*~struct~WindowParamJa:
 *
 * @param shape
 * @desc ウィンドウの形
 * @type select
 * @option 角丸(decorSize:0 で長方形)
 * @value roundrect
 * @option 破裂型(叫び)
 * @value spike
 * @option フキダシ(シッポつき角丸)
 * @value balloon
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
 * @desc 背景色(CSS形式)複数指定すると縦のグラデーションとして描画
 * @type string[]
 * @default ["#0086"]
 */

( function() {
	'use strict';
	const TF_SET_WINDOW = 'TF_SET_WINDOW';
	const SHAPE_ROUNDRECT = 'roundrect';
	const SHAPE_SPIKE = 'spike';
	const SHAPE_OCTAGON = 'octagon';
	const SHAPE_BALLOON = 'balloon';
	const SHAPE_NONE = 'none';
	const PARAM_TRUE = 'true';
	const workBitmap = new Bitmap( 1, 1 );
	const workCtx = workBitmap.context;

	// $gameMessage.positionType()
	const POSITION_UP = 0;
	const POSITION_MIDDLE = 1;
	const POSITION_DOWN = 2;

	const POSITION_LEFT = 'left';
	const POSITION_CENTER = 'center';
	const POSITION_RIGHT = 'right';

    /**
     * パラメータを受け取る
     */
	const pluginParams = PluginManager.parameters( 'TF_VectorWindow' );
    /**
     * 指定したパラメータの真偽値を返す。
     * @param {String} paramName パラメータ名
     * @param {Number} defaultParam 規定値
     * @returns {Boolean}
     */
	const getBooleanParam = ( paramName, defaultParam ) => {
		return pluginParams[ paramName ] ? ( pluginParams[ paramName ].toLowerCase() === PARAM_TRUE ) : defaultParam;
	};

	// プリセット設定
	const presetList = JsonEx.parse( pluginParams.preset );
	pluginParams.preset = presetList.map( value => {
		const params = JsonEx.parse( value );
		params.margin = parseFloatStrict( params.margin );
		params.borderWidth = parseFloatStrict( params.borderWidth );
		params.borderColor = params.borderColor;
		params.decorSize = parseFloatStrict( params.decorSize );
		params.padding = parseFloatStrict( params.padding );
		params.bgColor = JsonEx.parse( params.bgColor );
		return params;
	} );

	// 全体設定
	const SYSTEM_FONT_SIZE = parseFloatStrict( pluginParams.systemFontSize );
	const MESSAGE_FONT_SIZE = parseFloatStrict( pluginParams.messageFontSize );
	const LINE_HEIGHT = parseFloatStrict( pluginParams.lineHeight ) / 100;
	const MESSAGE_LINES = parseIntStrict( pluginParams.messageLines );
	const DROP_SHADOW = getBooleanParam( 'dropShadow', true );


	/**
	 * 与えられた文字列に変数が指定されていたら、変数の内容に変換して返す。
	 * @param {String} value 変換元の文字列( v[n]形式を含む )
	 * @return {String} 変換後の文字列
	 */
	function treatValue( value ) {
		if( value === undefined || value === '' ) return '0';
		if( value[ 0 ] === 'V' || value[ 0 ] === 'v' ) {
			return value.replace( /[V]\[([0-9]+)\]/i, ( match, p1 ) => $gameVariables.value( parseInt( p1, 10 ) ) );
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
				const newWindowType = parseIntStrict( args[ 0 ] ) - 1;
				if( newWindowType !== messageWindow.TF_windowType ) {
					messageWindow.TF_refleshWindow = true;
					messageWindow.TF_windowType = newWindowType;
				}
			}
		}
	};

	/*--- Window ---*/
	const _Window_initialize = Window.prototype.initialize;
	Window.prototype.initialize = function() {
		this.TF_refleshWindow = true;
		this.TF_windowType = 0;
		this.TF_shape = pluginParams.preset[ this.TF_windowType ].shape;

		_Window_initialize.call( this );

		this._margin = pluginParams.preset[ this.TF_windowType ].margin;
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
			return;
		}
		if( this.TF_shape === SHAPE_NONE ) return;

		const m = this.margin;
		const r = pluginParams.preset[ this.TF_windowType ].decorSize;
		const bitmap = new Bitmap( this._width, this._height + 4 );// +4 はdrop shadow用

		this._windowFrameSprite.bitmap = bitmap;
		this._windowFrameSprite.setFrame( 0, 0, this._width, this._height + 12 );

		let path2d;
		switch( this.TF_shape ) {
			case SHAPE_ROUNDRECT: path2d = drawRoundrect( m, this._width, this._height, r ); break;
			case SHAPE_OCTAGON: path2d = drawOctagon( m, this._width, this._height, r ); break;
			case SHAPE_SPIKE: path2d = drawSpike( m, this._width, this._height, r, pluginParams.preset[ this.TF_windowType ].borderWidth ); break;
		}
		drawWindow.call( this, bitmap.context, path2d );
	};


	/*--- Window_Base ---*/
	Window_Base.prototype.standardFontSize = () => SYSTEM_FONT_SIZE;
	Window_Base.prototype.standardPadding = function() {
		// Window_Command の initialize が Window_Base の initialize より先に standardPadding を呼ぶので
		// その際、this.TF_windowType が空になってしまう。以下の if はその対策。
		if( this.TF_windowType === undefined ) this.TF_windowType = 0;
		const preset = pluginParams.preset[ this.TF_windowType ];
		return preset.padding + preset.margin;
	};
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
	const TF_TAIL_HEIGHT = 40;// フキダシのシッポの高さ
	const TF_TAIL_POSISION = POSITION_LEFT;// フキダシのシッポの左右位置
	// $gameMessage.positionType() で上下位置は決まる
	Window_Message.prototype.standardFontSize = () => MESSAGE_FONT_SIZE;
	Window_Message.prototype.numVisibleRows = () => MESSAGE_LINES;
	Window_Message.prototype.textPadding = () => ( MESSAGE_FONT_SIZE * LINE_HEIGHT - MESSAGE_FONT_SIZE ) / 2;
	Window_Message.prototype.lineHeight = () => Math.ceil( MESSAGE_FONT_SIZE * LINE_HEIGHT );

	/**
	 * メッセージウィンドウに限りフキダシ表示を可能にする
	 */
	const _Window_Message_initialize = Window_Message.prototype.initialize;
	Window_Message.prototype.initialize = function() {
		this._positionType = 2;	// 先に位置を指定しておかないと、ウィンドウ生成時に形がおかしくなる
		_Window_Message_initialize.call( this );
	};

	// 表示前に TS_SET_WINDOW による変更があれば適用
	const _Window_Message_startMessage = Window_Message.prototype.startMessage;
	Window_Message.prototype.startMessage = function() {
		if( this.TF_refleshWindow ) {
			this.TF_refleshWindow = false;
			refreshWindowFrame( this );
		}
		_Window_Message_startMessage.call( this );
	};

	// 終了時にウィンドウタイプを規定値(0)に戻す。
	const _Window_Message_terminateMessage = Window_Message.prototype.terminateMessage;
	Window_Message.prototype.terminateMessage = function() {
		_Window_Message_terminateMessage.call( this );
		if( this.TF_windowType !== 0 ) {
			this.TF_windowType = 0;
			this.TF_refleshWindow = true;
		}
	};

	/**
	 * フキダシ型(balloon)のみ、Window_Message に設定できる。
	 */
	Window_Message.prototype._refreshBack = function() {
		if( this.TF_shape !== SHAPE_BALLOON ) {
			Window.prototype._refreshBack.call( this );
			return;
		}

		const m = this.margin;
		const r = pluginParams.preset[ this.TF_windowType ].decorSize;
		const bitmap = new Bitmap( this._width, this._height + 4 );// +4 はdrop shadow用
		this._windowFrameSprite.bitmap = bitmap;
		this._windowFrameSprite.setFrame( 0, 0, this._width, this._height + 12 );
		const path2d = drawBalloon( m, this._width, this._height, r, this._positionType );
		drawWindow.call( this, bitmap.context, path2d );
	}

	const _Window_Message_updatePlacement = Window_Message.prototype.updatePlacement;
	Window_Message.prototype.updatePlacement = function() {
		const isChange = ( this._positionType !== $gameMessage.positionType() );
		this._positionType = $gameMessage.positionType();
		this._height = this.windowHeight();

		_Window_Message_updatePlacement.call( this );

		if( !isChange ) return;
		this._refreshAllParts();
		if( this.TF_shape === SHAPE_BALLOON && this._positionType === POSITION_UP ) {
			this._windowPauseSignSprite.y = this._height - TF_TAIL_HEIGHT;
		}
	};

	/**
	 * コンテンツ位置を、尻尾の高さに合わせて調整。
	 */
	Window_Message.prototype._refreshContents = function() {
		if( this.TF_shape === SHAPE_BALLOON && this._positionType === POSITION_DOWN ) {
			this._windowContentsSprite.move( this.padding, this.padding + TF_TAIL_HEIGHT );
		} else {
			this._windowContentsSprite.move( this.padding, this.padding );
		}
	};
	const _Window_Message_windowHeight = Window_Message.prototype.windowHeight;
	Window_Message.prototype.windowHeight = function() {
		if( this.TF_shape !== SHAPE_BALLOON || this._positionType === POSITION_MIDDLE ) {
			return _Window_Message_windowHeight.call( this );
		} else {
			return _Window_Message_windowHeight.call( this ) + TF_TAIL_HEIGHT;
		}
	};


	/*--- 関数 ---*/
	/**
	 * ウィンドウ枠の再描画。
	 * @param {Window_Message} targetWindow 対象ウィンドウ
	 */
	function refreshWindowFrame( targetWindow ) {
		const preset = pluginParams.preset[ targetWindow.TF_windowType ];
		targetWindow.TF_shape = preset.shape;
		targetWindow._margin = preset.margin;
		// RPGツクールMVの padding は CSS と違い「box の一番外から contents までの距離」なので変換
		targetWindow._padding = preset.padding + preset.margin;
		targetWindow._height = targetWindow.windowHeight();
		targetWindow._refreshAllParts();
	}
	/**
	 * 配列からCSS color文字列を返す。
	 * @param {Array} colorList [ r, g, b, a ] の配列
	 * @returns {String} 'rgb(r,g,b)' か 'rgba(r,g,b,a)'の文字列
	 */
	function array2CssColor( colorList ) {
		if( colorList.length === 3 ) {
			return Utils.rgbToCssColor( ...colorList );
		} else {
			// Utils.rgbToCssColor( r, g, b ) は a を扱ってくれないので。
			return `rgba(${colorList[ 0 ]},${colorList[ 1 ]},${colorList[ 2 ]},${colorList[ 3 ] / 255})`;
		}
	}

	function cssColor2Array( CssColor ) {
		workCtx.clearRect( 0, 0, 1, 1 );
		workCtx.fillStyle = CssColor;
		workCtx.fillRect( 0, 0, 1, 1 );
		return workCtx.getImageData( 0, 0, 1, 1 ).data;
	}

	function drawWindow( ctx, path2d ) {
		let bgColor = pluginParams.preset[ this.TF_windowType ].bgColor;

		if( bgColor.length === 1 ) {
			ctx.fillStyle = tintColor( bgColor[ 0 ], this._colorTone );
		} else {
			const grad = ctx.createLinearGradient( 0, 0, 0, this._height );
			const l = bgColor.length;
			const interval = 1.0 / ( l - 1 )
			bgColor.forEach( ( e, i ) => {
				grad.addColorStop( i * interval, tintColor( e, this._colorTone ) );
			} );
			ctx.fillStyle = grad;
		}

		if( DROP_SHADOW ) setShadowParam( ctx );
		ctx.fill( path2d );// 'nonzero'  'evenodd'

		if( !DROP_SHADOW ) setShadowParam( ctx );
		setBorderParam( ctx, this.TF_windowType );
		ctx.stroke( path2d );
	}

	/**
	 * 
	 * @param {*} bgColor 
	 * @param {*} colorTone 
	 */
	function tintColor( bgColor, colorTone ) {
		const colorArray = cssColor2Array( bgColor );
		colorArray[ 0 ] += colorTone[ 0 ];
		colorArray[ 1 ] += colorTone[ 1 ];
		colorArray[ 2 ] += colorTone[ 2 ];

		return array2CssColor( colorArray );
	}
	/**
	 * ドロップシャドウの設定
	 * @param {*} ctx 
	 */
	function setShadowParam( ctx ) {
		ctx.shadowBlur = 4;
		ctx.shadowColor = 'black';
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 6;
	}

	/**
	 * 枠の設定をする
	 * @param {*} ctx 
	 */
	function setBorderParam( ctx, type ) {
		if( !pluginParams.preset[ type ].borderWidth ) return;

		ctx.lineWidth = pluginParams.preset[ type ].borderWidth;
		ctx.strokeStyle = pluginParams.preset[ type ].borderColor;
		ctx.shadowBlur = 3;
		ctx.shadowOffsetY = 0;
	}

	/**
	 * フキダシ(角丸の矩形シッポ付き)を描く
	 * @param {CanvasRenderingContext2D} ctx コンテキスト
	 * @param {Number} m 枠外のマージン
	 * @param {Number} w ウィンドウ描画領域の幅
	 * @param {Number} h ウィンドウ描画領域の高さ
	 * @param {Number} r 角丸の半径
	 */
	function drawBalloon( m, w, h, r, vPos ) {
		const hPos = TF_TAIL_POSISION;
		const dy = ( vPos === POSITION_UP ) ? TF_TAIL_HEIGHT : 0;	// 上位置表示の場合の下のシッポ高さ
		const uy = ( vPos === POSITION_DOWN ) ? TF_TAIL_HEIGHT : 0;	// 下位置表示の場合の上のシッポ高さ
		const iRect = { l: m, r: w - m, u: m + uy, d: h - m - dy };// 内側座標
		const cRect = { l: m + r, r: w - ( m + r ), u: m + r + uy, d: h - ( m + r ) - dy };// 角を除く内側座標

		const path = new Path2D();
		path.moveTo( cRect.l, iRect.u );
		if( vPos === POSITION_DOWN ) {
			if( hPos === POSITION_LEFT ) {
				// 左上にシッポ
				path.lineTo( cRect.l + 250, iRect.u );
				path.lineTo( cRect.l + 230, iRect.u - TF_TAIL_HEIGHT + m );
				path.lineTo( cRect.l + 270, iRect.u );
			} else if( hPos === POSITION_RIGHT ) {
				// 右上にシッポ
				path.lineTo( cRect.r - 270, iRect.u );
				path.lineTo( cRect.r - 230, iRect.u - TF_TAIL_HEIGHT + m );
				path.lineTo( cRect.r - 250, iRect.u );
			}
		}
		path.arcTo( iRect.r, iRect.u, iRect.r, cRect.u, r );// ─╮
		path.arcTo( iRect.r, iRect.d, cRect.r, iRect.d, r );//│ ╯
		if( vPos === POSITION_UP ) {
			if( hPos === POSITION_LEFT ) {
				// 左下にシッポ
				path.lineTo( cRect.l + 270, iRect.d );
				path.lineTo( cRect.l + 230, iRect.d + TF_TAIL_HEIGHT + m );
				path.lineTo( cRect.l + 250, iRect.d );
			} else if( hPos === POSITION_RIGHT ) {
				// 右下にシッポ
				path.lineTo( cRect.r - 250, iRect.d );
				path.lineTo( cRect.r - 230, iRect.d + TF_TAIL_HEIGHT - m );
				path.lineTo( cRect.r - 270, iRect.d );
			}
		}
		path.arcTo( iRect.l, iRect.d, iRect.l, cRect.d, r );//╰─
		path.arcTo( iRect.l, iRect.u, cRect.l, iRect.u, r );// │╭
		path.closePath();
		return path;
	}

	/**
	 * 角丸の矩形を描く
	 * @param {CanvasRenderingContext2D} ctx コンテキスト
	 * @param {Number} m 枠外のマージン
	 * @param {Number} w ウィンドウ描画領域の幅
	 * @param {Number} h ウィンドウ描画領域の高さ
	 * @param {Number} r 角丸の半径
	 */
	function drawRoundrect( m, w, h, r ) {
		const iRect = { l: m, r: w - m, u: m, d: h - m };// 内側座標
		const cRect = { l: m + r, r: w - ( m + r ), u: m + r, d: h - ( m + r ) };// 角を除く内側座標

		const path = new Path2D();
		path.moveTo( cRect.l, iRect.u );
		path.arcTo( iRect.r, iRect.u, iRect.r, cRect.u, r );// ─╮
		path.arcTo( iRect.r, iRect.d, cRect.r, iRect.d, r );//│ ╯
		path.arcTo( iRect.l, iRect.d, iRect.l, cRect.d, r );//╰─
		path.arcTo( iRect.l, iRect.u, cRect.l, iRect.u, r );// │╭
		path.closePath();
		return path;
	}

	/**
	 * 8角形を描く
	 * @param {CanvasRenderingContext2D} ctx コンテキスト
	 * @param {Number} m 枠外のマージン
	 * @param {Number} w ウィンドウ描画領域の幅
	 * @param {Number} h ウィンドウ描画領域の高さ
	 * @param {Number} r  √r*r = 角の斜め線の長さ
	 */
	function drawOctagon( m, w, h, r ) {
		const iRect = { l: m, r: w - m, u: m, d: h - m };// 内側座標
		const cRect = { l: m + r, r: w - ( m + r ), u: m + r, d: h - ( m + r ) };// 角を除く内側座標

		const path = new Path2D();
		path.moveTo( cRect.l, iRect.u );
		path.lineTo( cRect.r, iRect.u );//─
		path.lineTo( iRect.r, cRect.u );// ╲
		path.lineTo( iRect.r, cRect.d );// │ 
		path.lineTo( cRect.r, iRect.d );// ╱
		path.lineTo( cRect.l, iRect.d );// ─
		path.lineTo( iRect.l, cRect.d );// ╲
		path.lineTo( iRect.l, cRect.u );// │
		path.closePath();
		return path;
	}

	/**
	 * トゲ型装飾枠を描く
	 * @param {CanvasRenderingContext2D} ctx コンテキスト
	 * @param {Number} m トゲの長さ
	 * @param {Number} w ウィンドウ描画領域の幅
	 * @param {Number} h ウィンドウ描画領域の高さ
	 * @param {Number} r トゲの(おおよその)横幅
	 */
	function drawSpike( m, w, h, r, bw ) {

		const iRect = { l: m, r: w - m, u: m, d: h - m };// 内側座標
		const oRect = { l: bw, r: w - bw, u: bw, d: h - bw };// 外側座標

		const rndDiff = () => ( Math.random() - 0.5 ) * r * 0.4; // 中央値からの差、辺に使う
		const rndPosi = () => Math.random() * m * 0.6; // 正の値、角に使う

		const path = new Path2D();
		// path.beginPath();
		path.moveTo( oRect.l + rndPosi(), oRect.u + rndPosi() );//┌
		const hNum = Math.floor( w / ( r * 1.2 ) );
		const hUnit = w / hNum;

		for( let i = 1; i < hNum - 2; i++ ) {
			path.lineTo( iRect.l + i * hUnit + rndDiff(), iRect.u );
			path.lineTo( iRect.l + ( i + 0.5 ) * hUnit + rndDiff(), oRect.u );// 人
		}
		path.lineTo( iRect.r - hUnit / 2 + rndDiff(), iRect.u );

		path.lineTo( oRect.r - rndPosi(), oRect.u + rndPosi() );//┐

		path.lineTo( iRect.r, ( h + rndDiff() ) / 2 - r / 3 );
		path.lineTo( iRect.r + m / 2, ( h + rndDiff() ) / 2 );// >
		path.lineTo( iRect.r, ( h + rndDiff() ) / 2 + r / 3 );

		path.lineTo( oRect.r - rndPosi(), oRect.d - rndPosi() );// ┘

		for( let i = 1; i < hNum - 2; i++ ) {
			path.lineTo( iRect.r - i * hUnit + rndDiff(), iRect.d );
			path.lineTo( iRect.r - ( i + 0.5 ) * hUnit + rndDiff(), oRect.d );// Ｙ
		}
		path.lineTo( iRect.l + hUnit / 2 + rndDiff(), iRect.d );

		path.lineTo( oRect.l + rndPosi(), oRect.d - rndPosi() );//└

		// <
		path.lineTo( iRect.l, ( h + rndDiff() ) / 2 + r / 3 );
		path.lineTo( iRect.l - m / 2, ( h + rndDiff() ) / 2 );
		path.lineTo( iRect.l, ( h + rndDiff() ) / 2 - r / 3 );

		path.closePath();
		return path;
	}
} )();