//========================================
// TF_TextWindowMenu.js
// Version :0.1.0.0
// For : RPGツクールMV (RPG Maker MV)
// -----------------------------------------------
// Copyright : Tobishima-Factory 2020
// Website : http://tonbi.jp
//
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//========================================
/**
 * 
 */
/*:ja
 * @plugindesc タイトルにテキストウィンドウ表示メニューを追加。
 * @author とんび@鳶嶋工房
 *
 * @param MenuLabel
 * @desc タイトル画面でのメニュー名。
 * @type string
 * @default 著作・製作
 * 
 * @param Lines
 * @desc ウィンドウの行数。
 * @type number
 * @default 12
 * 
 * @param Contents
 * @desc ウィンドウに表示する内容(制御文字が使えます)
 * @type note
 * @default "\\}(c)KADOKAWA CORPORATION\\{"
 *
 * @help
 *
 * 利用規約 : MITライセンス
 */
( function() {
	'use strict';
	const MENU_LABEL = 'MenuLabel';
	const CONTENTS_LINES = 'Lines';
	const CONTENTS_TEXT = 'Contents';
	const TF_OPEN_WINDOW_COMMAND = 'TF_OPEN_WINDOW_COMMAND';

    /**
     * パラメータを受け取る
     */
	const pluginParams = PluginManager.parameters( 'TF_TextWindowMenu' );

	let TF_menuLabel = '著作・製作';    // メニュー名規定値
	if( pluginParams[ MENU_LABEL ] ) {
		TF_menuLabel = pluginParams[ MENU_LABEL ];
	}

	let TF_lines = 12;
	if( pluginParams[ CONTENTS_LINES ] ) {
		TF_lines = parseInt( pluginParams[ CONTENTS_LINES ], 10 );
	}

	let TF_contents = '\\}(c)KADOKAWA CORPORATION\\{';
	if( pluginParams[ CONTENTS_TEXT ] ) {
		TF_contents = JsonEx.parse( pluginParams[ CONTENTS_TEXT ] );
	}


	/*---- Window_TitleCommand ----*/
	/**
	 * タイトルのメニューにコマンドを追加。
	 */
	const _Window_TitleCommand_makeCommandList = Window_TitleCommand.prototype.makeCommandList;
	Window_TitleCommand.prototype.makeCommandList = function() {
		_Window_TitleCommand_makeCommandList.call( this );

		this.addCommand( TF_menuLabel, TF_OPEN_WINDOW_COMMAND );
	};


	/*---- Scene_Title ----*/
	/**
	 * コマンドハンドラを追加。
	 */
	const _Scene_Title_createCommandWindow = Scene_Title.prototype.createCommandWindow;
	Scene_Title.prototype.createCommandWindow = function() {
		_Scene_Title_createCommandWindow.call( this );

		this._commandWindow.setHandler( TF_OPEN_WINDOW_COMMAND, () => {
			this._commandWindow.close();
			SceneManager.push( Scene_TF_SingleWindow );
		} );
	};

	/*---- Scene_TF_SingleWindow ----*/
	class Scene_TF_SingleWindow extends Scene_MenuBase {
		constructor() {
			super();
		}

		create() {
			super.create();
			this._creditWindow = new Window_Help( TF_lines );
			this.addWindow( this._creditWindow );
			this._creditWindow.y = ( Graphics.boxHeight - this._creditWindow.height ) / 2;
			this._creditWindow.setText( TF_contents );
			this._creditWindow.pause = true;
		}

		update() {
			super.update();
			// 入力のチェック
			if(
				TouchInput.isTriggered() ||
				TouchInput.isCancelled() ||
				Input.isTriggered( 'ok' ) ||
				Input.isTriggered( 'cancel' )
			) {
				SoundManager.playCursor();
				SceneManager.pop()
			}
		}
	}

} )();
