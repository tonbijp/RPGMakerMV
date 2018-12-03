//========================================
// TF_WallOverlap
// Version :0.0.0.1 
// For : RPGツクールMV (RPG Maker MV)
// -----------------------------------------------
// Copyright : Tobishima-Factory 2018
// Website : http://tonbi.jp
//
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
//========================================
/*:
 * @plugindesc 壁の後ろを歩けるようにし、高層[☆]タイルに通行設定を適用する。
 * @author とんび@鳶嶋工房
 * 
 * @help
 * 
 * 利用規約 : MITライセンス
 */
    
(function(){'use strict';
/**
 * 指定位置の指定フラグビットが通行可か。
 * @param {Number} x タイル数
 * @param {Number} y タイル数
 * @param {Number} bit {@link RPG.Tileset}の flagsチェック用ビット
 * @returns {Boolean} 高層表示[☆]も含め、4方向の通行設定で通行不可がひとつでもあれば false。
 */
const _Game_Map_checkPassage = Game_Map.prototype.checkPassage;
Game_Map.prototype.checkPassage = function( x, y, bit ){
    const flags = this.tilesetFlags();
    const tiles = this.allTiles( x, y );
    for ( let i = 0; i < tiles.length; i++ ){
        const tileId = tiles[ i ];
        const flag = flags[ tileId ];
        if (( flag & bit ) === bit ) return false;  // [×] 通行不可
        if ( Tilemap.isRoofTile( tileId ) && 1 < tileId % 4 ) return true; // 屋根上端は通行可
        if ( Tilemap.isWallTopTile( tileId ) ) return true; // 壁(上)上端は通行可
    }
    return _Game_Map_checkPassage.call( this, x, y, bit );
};

/**
 * JSONの読み込みが完了した時に呼ばれる
 * @param {Object} object 読み込み完了したJSONオブジェクト
 */
const _DataManager_onLoad = DataManager.onLoad;
DataManager.onLoad = function(object ){
    _DataManager_onLoad.call( this, object );

    if( object === $dataTilesets ){
        // 全タイルセットに対して設定
        for( const currentObject of object ){
            if( !currentObject ) continue;
            const flags = currentObject.flags;

            // 屋根タイル(A3の1,3列)を走査
            let tileId = Tilemap.TILE_ID_A3;
            for( const tileOffset of [0, 48 * 16] ){
                tileId += tileOffset ;
                for( let x = 0; x < 8; x++ ){
                    setTopRoof2UpperLayer( flags, tileId + x * 48 );
                }
            }
            // 壁(上)タイル(A4の1,3列)を走査(5列には適用しない)
            tileId = Tilemap.TILE_ID_A4;
            for( const tileOffset of [0, 48 * 16] ){
                tileId += tileOffset ;
                for( let x = 0; x < 8; x++ ){
                    setTopWall2UpperLayer( flags, tileId + x * 48 );
                }
            }
        }
    }

    //  屋根の上端のみを高層表示[☆]に設定
    function setTopRoof2UpperLayer( flags, tileId ){
        flags[ tileId + 2 ] =  flags[ tileId + 3 ] =
        flags[ tileId + 6 ] =  flags[ tileId + 7 ] =
        flags[ tileId + 10 ] = flags[ tileId + 11 ] = 
        flags[ tileId + 14 ] = flags[ tileId + 15 ] = 0x0010;
    }
    //  壁(上)の上端のみを高層表示[☆]に設定
    function setTopWall2UpperLayer( flags, tileId ){
        flags[ tileId + 20 ] =  flags[ tileId + 21 ] =
        flags[ tileId + 22 ] =  flags[ tileId + 23 ] =
        flags[ tileId + 33 ] = flags[ tileId + 34 ] = 
        flags[ tileId + 35 ] = flags[ tileId + 36 ] = 
        flags[ tileId + 37 ] = flags[ tileId + 42 ] = 
        flags[ tileId + 43 ] = flags[ tileId + 45 ] =
        flags[ tileId + 46 ] = 0x0010;
    }
}
})();


