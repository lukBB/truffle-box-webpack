const ItemManager = artifacts.require("./ItemManager.sol");

contract("ItemManager", accounts => {
it("... should let you create new Items.", async () => {
    const itemManagerInstance = await ItemManager.deployed();
    const itemName = "test1";
    const itemPrice = 500;

    const result = await itemManagerInstance.createItem(itemName, itemPrice, { from: accounts[0] });
    
    //console.log(result.logs[0].args)
    //assert.equal(result.logs[0].args._index, 0, "There should be one item index in there")
    const item = await itemManagerInstance.items(0);
    assert.equal(item._id, itemName, "The item has a different identifier");
});
});