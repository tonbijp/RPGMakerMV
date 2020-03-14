//========================================
// TF_TextWindowMenu.js
// Version :0.2.0.0
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
 * @param windowParams
 * @desc ウィンドウの設定
 * @type struct<WindowParamJa>[]
 * @default ["{\"menuLabel\":\"著作・製作\",\"lines\":\"12\",\"contents\":\"\\\"\\\\\\\\}(c)KADOKAWA CORPORATION\\\\\\\\{\\\"\"}"]
 *
 * @help
 * タイトル画面への著作権情報や操作説明の追加を想定したプラグインです。
 * 
 * windowParams パラメータ1行につき1メニューがタイトル画面に追加されます。
 * そのメニューを選択すると、ウィンドウが1枚開きます。
 * 
 * ウィンドウの行数は lines パラメータで指定します。
 * 
 * contents パラメータを入力する際はコンテクストメニュー(右クリック)の
 * [アイコンセットビューア]を利用して \I[n] の n の数値を入力できます。
 * その他、メッセージと同じ制御文字が使えますので、ご活用ください。
 *
 * 利用規約 : MITライセンス
 */
/*~struct~WindowParamJa:
 *
 * @param menuLabel
 * @desc タイトル画面でのメニュー名。
 * @type string
 * @default 著作・製作
 *
 * @param lines
 * @desc ウィンドウの行数。
 * @type number
 * @default 12
 *
 * @param contents
 * @desc ウィンドウに表示する内容(制御文字が使えます)
 * @type note
 * @default "\\}(c)KADOKAWA CORPORATION\\{"
 */
( function() {
	'use strict';
	const TF_OPEN_WINDOW_COMMAND = 'TF_OPEN_WINDOW_COMMAND';

    /**
     * パラメータを受け取る
     */
	const pluginParams = PluginManager.parameters( 'TF_TextWindowMenu' );
	let TF_windows = JsonEx.parse( pluginParams.windowParams );
	TF_windows = TF_windows.map( value => JsonEx.parse( value ) );
	let TF_topRows;
	let TF_itemIndex;


	/*---- Window_TitleCommand ----*/
	/**
	 * タイトルのメニューにコマンドを追加。
	 */
	const _Window_TitleCommand_makeCommandList = Window_TitleCommand.prototype.makeCommandList;
	Window_TitleCommand.prototype.makeCommandList = function() {
		_Window_TitleCommand_makeCommandList.call( this );

		TF_topRows = this.maxItems();
		TF_windows.forEach( e => this.addCommand( e.menuLabel, TF_OPEN_WINDOW_COMMAND ) );
	};
	// 選択中の項目を記録
	Window_TitleCommand.prototype.select = function( index ) {
		Window_Command.prototype.select.apply( this, arguments );
		TF_itemIndex = index - TF_topRows;
	}

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
		create() {
			super.create();

			this._singleWindow = new Window_Help( parseInt( TF_windows[ TF_itemIndex ].lines, 10 ) );
			this.addWindow( this._singleWindow );
			this._singleWindow.y = ( Graphics.boxHeight - this._singleWindow.height ) / 2;
			this._singleWindow.pause = true;
			this._singleWindow.openness = 0;
			this._singleWindow.open();
		}

		update() {
			super.update();

			if( this._singleWindow.isOpen() ) {
				if( !this._singleWindow._text ) {
					const contents = JsonEx.parse( TF_windows[ TF_itemIndex ].contents );
					this._singleWindow.setText( contents );
				}
				// 入力のチェック
				if( TouchInput.isTriggered() ||
					TouchInput.isCancelled() ||
					Input.isTriggered( 'ok' ) ||
					Input.isTriggered( 'cancel' )
				) {
					SoundManager.playCursor();
					this._singleWindow.close();
				}
			} else if( this._singleWindow.isClosed() ) {
				SceneManager.pop();
			}
		}
	}

} )();
