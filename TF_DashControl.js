//========================================
// TF_DashControl
// Version :1.0.0.0 
// For : RPGツクールMV (RPG Maker MV)
// -----------------------------------------------
// Copyright : Tobishima-Factory 2018
// Website : http://tonbi.jp
//
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//========================================
/*:
 * @plugindesc ダッシュ可・不可制御と、その状態のセーブファイルへの保存
 * @author とんび@鳶嶋工房
 * 
 * @param Show AlwaysDash menu
 * @desc [オプション] メニューに[常時ダッシュ]を表示させるか
 * 表示 : true | 消す : false
 * @default true
 * 
 * @help プラグインコマンド
 * ・TF_DASH_ENABLED 真偽値
 * ダッシュ可能状態を設定します
 * true : ダッシュ可
 * false : ダッシュ不可
 * 
 * JavaScriptから使う場合は
 * $GameSystem.TF_DashEnabled( true );  // ダッシュ可
 * $GameSystem.TF_DashEnabled( false );// ダッシュ不可
 * 
 * 利用規約 : MITライセンス
 */

( function() {
    'use strict';
    const PLUGIN_NAME = 'TF_DashControl';
    const SHOW_MENU = 'Show AlwaysDash menu';
    const PLUGIN_COMMAND = 'TF_DASH_ENABLED';

    /**
     * 初期化イベント(的なアレ)
     */
    const _Game_System_initialize = Game_System.prototype.initialize;
    Game_System.prototype.initialize = function() {
        _Game_System_initialize.call( this );
        this.TF_dashEnabled = true; // セーブ用変数を用意
    };

    /**
     * プラグインコマンドの実行
     */
    const _Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function( command, args ) {
        _Game_Interpreter_pluginCommand.call( this, command, args );

        if( command.toUpperCase() !== PLUGIN_COMMAND ) return;

        const dashEnabled = ( args[ 0 ].toLowerCase() === 'true' );
        $gameSystem.TF_DashEnabled( dashEnabled );
    };

    /**
     * ダッシュ可能状態の設定
     * @param {Boolean} dashEnabled 注:isDashDisabledとは真偽逆
     */
    Game_System.prototype.TF_DashEnabled = function( dashEnabled ) {
        this.TF_dashEnabled = ( dashEnabled == 'false' );
    };

    /**
     * @returns {Boolean} ダッシュ不可か
     */
    const _Game_Map_isDashDisabled = Game_Map.prototype.isDashDisabled;
    Game_Map.prototype.isDashDisabled = function() {
        return !$gameSystem.TF_dashEnabled || _Game_Map_isDashDisabled.call( this );
    };

    // [常時ダッシュ]メニューの表示・非表示の設定
    const showAlwaysDashMenu = PluginManager.parameters( PLUGIN_NAME )[ SHOW_MENU ];
    if( showAlwaysDashMenu.toLowerCase() === 'true' ) return;

    const _Window_Command_addCommand = Window_Command.prototype.addCommand;
    Window_Options.prototype.addCommand = function( name, symbol, enabled, ext ) {
        if( symbol === 'alwaysDash' ) return;
        _Window_Command_addCommand.call( this, name, symbol, enabled, ext );
    };
} )();


