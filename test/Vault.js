const config = require('../config')
const VaultContract = artifacts.require('Vault')
const Standard20TokenMock = artifacts.require('Standard20TokenMock')
  
  contract('Vault:', function (accounts) {
    let token
    let vault
    let voterAccounts = web3.eth.accounts.slice(1, 4)

    beforeEach(async () => {
      token = await Standard20TokenMock.new(voterAccounts, config.totalTokens)
      vault = await VaultContract.new()
    })

    it('deposits ERC20s', async () => {
      await token.approve(vault.address, 10)
      await vault.deposit(0, token.address, accounts[0], 5)

      assert.equal(await token.balanceOf(vault.address), 5, "token accounting should be correct")
      assert.equal(await vault.balance(token.address), 5, "vault should know its balance")
    })

    it('transfers tokens', async () => {
      const tokenReceiver = accounts[2]
      await token.transfer(vault.address, 10)
      await vault.transfer(token.address, tokenReceiver, 5, '')
      assert.equal(await token.balanceOf(tokenReceiver), 5, "receiver should have correct token balance")
    })

    it('fails if not sufficient token balance available', async () => {
      const approvedAmount = 10
      await token.approve(vault.address, approvedAmount)

      return assertRevert(async () => {
          await vault.deposit(token.address, accounts[0], approvedAmount * 2)
      })
    })
  })
