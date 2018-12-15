//========================================
// TF_LayeredMap
// Version :0.0.1.0 
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
/**
 * 今後の予定
 * ・2階以上の指定に対応する(ループに注意)
 */
(function(){'use strict';

const PLUGIN_NAME = 'TF_LayeredMap';
const pluginParams = PluginManager.parameters( PLUGIN_NAME );

/**
 * タイルセットの画像を設定する。
 * マップ開始時に呼ばれる。
 */
const _ShaderTilemaprefreshTileset = ShaderTilemap.prototype.refreshTileset;
ShaderTilemap.prototype.refreshTileset = function() {
    _ShaderTilemaprefreshTileset.call(this);

    // BitmapをPIXI.Textureにコンバート
    const bitmaps = this.bitmaps.map(function(x) {
        return x._baseTexture ? new PIXI.Texture(x._baseTexture) : x;
   } );

   // 書き割りのタイルセットの画像をアップデート
   for( let curItem of this.TF_billboards ){
        curItem.children[0].setBitmaps( bitmaps );
   }
}

/**
 * 
 */
const _ShaderTilemap_createLayers = ShaderTilemap.prototype._createLayers;
ShaderTilemap.prototype._createLayers = function() {
    _ShaderTilemap_createLayers.call(this);

    // 書き割り風オブジェクトを
    // 画面に表示される縦のタイル数+1 生成
    // +1 はスクロールの際にはみ出す部分
    // TODO:書き割りに高さが追加されると、さらに足す必要がある
    const th = this._tileHeight;
    const tileRows = Math.ceil(this._height / th) + 1;

    if( !this.hasOwnProperty( 'TF_billboards' ) ){
        this.TF_billboards = [];
    }

    for( let i = 0; i < tileRows; i++ ){
        const billboard = new PIXI.tilemap.ZLayer( this, 3 );
        billboard.spriteId = -Infinity;
        this.addChild( billboard );
        this.TF_billboards.push( billboard );
        const layer = new PIXI.tilemap.CompositeRectTileLayer( 0, [], 0 );
        billboard.addChild( layer );
    }
};

/**
 * 描画前に書き割りの中を空にしておく。
 */
const _ShaderTilemap_paintAllTiles = ShaderTilemap.prototype._paintAllTiles;
ShaderTilemap.prototype._paintAllTiles = function(startX, startY) {
    for( let curItem of this.TF_billboards ){
        curItem.clear();
    }

    _ShaderTilemap_paintAllTiles.call( this, startX, startY );
}

/**
 * タイルマップと書き割りの描画。
 * 関数をまるっと書き換えているので
 * 他のプラグインとコンフリクトを起こしてしまうので注意。
 * @param {Number} startX 開始 マップ x座標(タイル数)
 * @param {Number} startY 開始 マップ y座標(タイル数)
 * @param {Number} x 画面上の x座標(タイル数)
 * @param {Number} y 画面上の y座標(タイル数)
 */
//const _ShaderTilemap_paintTiles = ShaderTilemap.prototype._paintTiles;
ShaderTilemap.prototype._paintTiles = function( startX, startY, x, y ) {
    //_ShaderTilemap_paintTiles.call( this, startX, startY, x, y );

    const mx = startX + x; //  描画対象のマップ x座標(タイル数)
    const my = startY + y; //  描画対象のマップ y座標(タイル数)
    const dx = x * this._tileWidth; //  描画位置の x座標(ピクセル)
    const dy = y * this._tileHeight; //  描画位置の y座標(ピクセル)

    const tileId0 = this._readMapData( mx, my, 0 ); // 低層タイルA
    const tileId1 = this._readMapData( mx, my, 1 ); // 低層タイルA2右側など
    const tileId2 = this._readMapData( mx, my, 2 ); // B 〜 E タイル
    const tileId3 = this._readMapData( mx, my, 3 ); // B 〜 E タイル
    const shadowBits = this._readMapData( mx, my, 4 ); // 影ペン
    const upperTileId1 = this._readMapData( mx, my - 1, 1 ); // 上位置の低層タイルA

    const lowerLayer = this.lowerLayer.children[ 0 ];     // 低層レイヤ( z: 0 )
    const upperLayer = this.upperLayer.children[ 0 ];   // 高層レイヤ( z: 4 )

    /**
     * タイルを描画(upperLayer,lowerLayer,dx,dy は親の変数を使う)
     * @param {Number} tileId タイルID
     */
    const drawTile = ( tileId ) => {
        if ( this._isHigherTile( tileId ) ) {
            // 全方向通行可の場合は高層マップレイヤに表示
            if( this.flags[ tileId ] & 0xF ){
                this._drawTile( this.TF_billboards[ y ].children[ 0 ].children[ 0 ], tileId, dx, -this._tileHeight );
                
            }else{
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
 * (スクロールに合わせて)書き割りの表示位置を変更
 * @param {Number} startX
 * @param {Number} startY
 */
const _ShaderTilemap_updateLayerPositions = ShaderTilemap.prototype._updateLayerPositions;
ShaderTilemap.prototype._updateLayerPositions = function( startX, startY ) {
    _ShaderTilemap_updateLayerPositions.call( this, startX, startY );

    let ox,oy;
    if (this.roundPixels) {
        ox = Math.floor(this.origin.x);
        oy = Math.floor(this.origin.y);
    } else {
        ox = this.origin.x;
        oy = this.origin.y;
    }
    const th = this._tileHeight;
    const tw = this._tileWidth;
    const posX = startX * tw - ox;
    const posY = startY * th - oy
    const l = this.TF_billboards.length;
    for( let i = 0; i < l; i++ ) {
        const curItem = this.TF_billboards[ i ];
        curItem.position.x = posX;
        curItem.position.y = posY + ( i + 1) * th;
    };
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
