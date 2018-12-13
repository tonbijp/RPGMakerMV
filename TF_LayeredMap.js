//========================================
// TF_LayeredMap
// Version :0.0.0.0 
// For : RPGツクールMV (RPG Maker MV)
// -----------------------------------------------
// Copyright : Tobishima-Factory 2018
// Website : http://tonbi.jp
//
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//========================================
/*:
 * @plugindesc 高層[☆]タイルを書き割り風に配置する
 * @author とんび@鳶嶋工房
 * 
 * @help
 * 通行設定に[☆]を指定したあと、通行設定(4方向)の設定によって挙動が異なる 
 * 0x0 ↑→←↓ : [☆] 設定、全方向に 通行可(プラグインなしと同じ)
 * 0x1 ↑→←・ : 書き割り、上　左右 通行可、1階 (基本、これを柵に使えばいい)
 * 0x2 ↑→・↓ : 書き割り、上下　右 通行可、1階 (柵の左側とか)┃
 * 0x3 ↑→・・ : 書き割り、上　　右 通行可、1階 (柵の左下とか)┗
 * 0x4 ↑・←↓ : 書き割り、上下左　 通行可、1階 (柵の右側とか)   ┃
 * 0x5 ↑・←・ : 書き割り、上　左　 通行可、1階 (柵の右下とか)   ┛
 * 0x6 ↑・・↓ : 書き割り、上下　　 通行可、1階 (両脇に木とか)┃┃
 * 0x7 ↑・・・ : 書き割り、上　　　 通行可、1階 (張り出し的な)┗┛
 * 0x8 ・→←↓ : 書き割り、全方向に 通行可、1階 (草むらなどに)
 * 0x9 ・→←・ : 書き割り、全方向に 通行可、2階(予定)
 * 0xA ・→・↓ : 書き割り、全方向に 通行可、3階(予定)
 * 0xB ・→・・ : 書き割り、全方向に 通行可、4階(予定)
 * 0xC ・・←↓ : 未設定
 * 0xD ・・←・ : 未設定
 * 0xE ・・・↓ : 未設定
 * 0xF ・・・・ : 未設定
 * 
 * 利用規約 : MITライセンス
 */

(function(){'use strict';

const PLUGIN_NAME = 'TF_LayeredMap';
const pluginParams = PluginManager.parameters( PLUGIN_NAME );

const _Spriteset_Map_createLowerLayer = Spriteset_Map.prototype.createLowerLayer;
Spriteset_Map.prototype.createLowerLayer = function() {
    _Spriteset_Map_createLowerLayer.call(this);

    /**
     * 書き割り風オブジェクトの生成
     * @param {Tilemap} tilemap タイルマップ
     * @param {Number} y マップ上のy座標(下位置のピクセル)
     * @returns {RectTileLayer}
     */
    function makeBillboard( tilemap, y ){
        const zLayer = new PIXI.tilemap.ZLayer( tilemap, 3 );
        zLayer.y = y;
        zLayer.spriteId = -Infinity;
        tilemap.addChild( zLayer );
        const lowerLayer = new PIXI.tilemap.CompositeRectTileLayer( 0, [], 0 );

        const bitmaps = tilemap.bitmaps.map(function(x) {
             return x._baseTexture ? new PIXI.Texture(x._baseTexture) : x;
        } );
        lowerLayer.setBitmaps( bitmaps );
        zLayer.addChild( lowerLayer );
        return lowerLayer.children[0];
    }

    let setNumber = 0;

    // マップ情報を取り出す
    const flags = $gameMap.tilesetFlags();
    const tw = $gameMap.tileWidth();
    const th = $gameMap.tileHeight();
    const sw = $gameMap.width();
    const sh = $gameMap.height();

    for( let y = 0; y < sh; y++ ){
        const layer = makeBillboard(this._tilemap, tw + y * tw );
        for( let x = 0; x < sw; x++ ){
            for( let z = 3; z < 5; z++ ){
                const tileId = $gameMap.tileId (x, y, z);
                // [☆]かつ通行不可フラグが立ってる場合、以外は処理しない
                if( ( flags[ tileId ] & 0x10 ) && ( flags[ tileId ] & 0xF ) ){
                    this._tilemap._drawNormalTile(layer, tileId, x * tw, -th);
                }
            }
        }
    }
};


/**
 * 描画
 * @method _paintTiles
 * @param {Number} startX
 * @param {Number} startY
 * @param {Number} x
 * @param {Number} y
 * @private
 */
const _ShaderTilemap_paintTiles = ShaderTilemap.prototype._paintTiles;
ShaderTilemap.prototype._paintTiles = function( startX, startY, x, y ) {
    //_ShaderTilemap_paintTiles.call( this, startX, startY, x, y );

    const mx = startX + x;
    const my = startY + y;
    const dx = x * this._tileWidth;
    const dy = y * this._tileHeight;

    const tileId0 = this._readMapData( mx, my, 0 ); // 下層タイルA
    const tileId1 = this._readMapData( mx, my, 1 ); // 下層タイルA2右側など
    const tileId2 = this._readMapData( mx, my, 2 ); // B 〜 E タイル
    const tileId3 = this._readMapData( mx, my, 3 ); // B 〜 E タイル
    const shadowBits = this._readMapData( mx, my, 4 ); // 影ペン
    const upperTileId1 = this._readMapData( mx, my - 1, 1 ); // 上位置の下層タイルA

    const lowerLayer = this.lowerLayer.children[ 0 ];     // 下層レイヤ(z:)
    const upperLayer = this.upperLayer.children[ 0 ];   // 上層レイヤ

    /**
     * タイルを描画(upperLayer,lowerLayer,dx,dy は親の変数を使う)
     * @param {Number} tileId タイルID
     */
    const drawTile = ( tileId ) => {
        if ( this._isHigherTile( tileId ) ) {
            // 全方向通行可の場合は高層マップレイヤに表示
            if( ( this.flags[ tileId ] & 0xF ) === 0 ){
                this._drawTile( upperLayer, tileId, dx, dy );
            }
        } else {
            this._drawTile( lowerLayer, tileId, dx, dy );
        }
    }

    drawTile( tileId0 );
    drawTile( tileId1 );

    this._drawShadow( lowerLayer, shadowBits, dx, dy );
    if ( this._isTableTile( upperTileId1 ) && !this._isTableTile( tileId1 ) ) {
        if ( !Tilemap.isShadowingTile( tileId0 ) ) {
            this._drawTableEdge( lowerLayer, upperTileId1, dx, dy );
        }
    }

    if ( this._isOverpassPosition( mx, my ) ) {
        this._drawTile( upperLayer, tileId2, dx, dy );
        this._drawTile( upperLayer, tileId3, dx, dy );
    } else {
        drawTile( tileId2 );
        drawTile( tileId3 );
    }
};


/**
 * 指定位置の指定フラグビットが通行可か。
 * @param {Number} x タイル数
 * @param {Number} y タイル数
 * @param {Number} bit {@link RPG.Tileset}の flagsチェック用ビット
 * @returns {Boolean} 高層表示[☆]の4方向の通行設定については@helpを参照
 */
const _Game_Map_checkPassage = Game_Map.prototype.checkPassage;
Game_Map.prototype.checkPassage = function( x, y, bit ){
    const flags = this.tilesetFlags();
    const tiles = this.allTiles( x, y );
    for ( let i = 0; i < tiles.length; i++ ){
        const tileId = tiles[ i ];
        const flag = flags[ tileId ];
        if( (flag & 0x18) === 0x18 ) continue; // [☆] かつ上通行不可設定の場合は無視
        if( ( flag & bit ) === bit ) return false;  // [×] 通行不可
        if( Tilemap.isRoofTile( tileId ) && 1 < tileId % 4 ) return true; // 屋根上端は通行可
        if( Tilemap.isWallTopTile( tileId ) ) return true; // 壁(上)上端は通行可
    }
    return _Game_Map_checkPassage.call( this, x, y, bit );
};

})();
